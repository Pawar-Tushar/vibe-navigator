from fastapi import APIRouter, HTTPException, Query, Body, BackgroundTasks
from typing import List
from models.place import Location, VibeAgentRequest, VibeAgentResponse, TourPlannerRequest

from db.mongo import get_location_collection
from services import gemini_rag 
from services.on_demand_scraper import scrape_and_populate_db 

router = APIRouter(
    prefix="/vibes",
    tags=["Vibe Navigator"]
)


@router.get("/locations", response_model=List[Location])
async def get_locations_by_city_and_category(
    city: str = Query(..., description="City to search in, e.g., 'pune'"),
    category: str = Query(..., description="Category of the place, e.g., 'cafe'")
):
    location_collection = await get_location_collection()
    db_query = {
        "city": city.lower(),
        "category": category.lower()
    }

    locations_cursor = location_collection.find(db_query).limit(50)
    results = await locations_cursor.to_list(length=50)

    if results:
        print(f"Found {len(results)} cached locations for {city}/{category}.")
        return results
    else:
        print(f"No cached data for {city}/{category}. Returning empty list.")
        return []

@router.post("/agent/chat", response_model=VibeAgentResponse)
async def chat_with_vibe_agent(request: VibeAgentRequest = Body(...)):

    if not request.query or not request.city:
        raise HTTPException(status_code=400, detail="Query and city are required.")
    
    history_as_dicts = [msg.dict() for msg in request.chat_history]

    response_data = await gemini_rag.generate_conversational_response(
        user_query=request.query,
        city=request.city,
        chat_history=history_as_dicts
    )
    
    return response_data



@router.post("/agent/tour", response_model=VibeAgentResponse)
async def create_vibe_tour(request: TourPlannerRequest = Body(...)):

    if not request.vibe_tags:
        raise HTTPException(status_code=400, detail="At least one vibe tag is required.")

    response_data = await gemini_rag.generate_tour_plan(
        city=request.city,
        vibe_tags=request.vibe_tags
    )
    
    return response_data