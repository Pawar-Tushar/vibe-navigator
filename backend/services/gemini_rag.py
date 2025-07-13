import google.generativeai as genai
import os
from dotenv import load_dotenv
from typing import List, Dict, Optional
from bson import ObjectId
from pinecone import Pinecone

from db.mongo import get_location_collection

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = "vibe-navigator"

if not all([GEMINI_API_KEY, PINECONE_API_KEY, PINECONE_INDEX_NAME]):
    raise ValueError("One or more environment variables (Gemini, Pinecone) are missing.")

genai.configure(api_key=GEMINI_API_KEY)
pc = Pinecone(api_key=PINECONE_API_KEY)
pinecone_index = pc.Index(PINECONE_INDEX_NAME)

EMBEDDING_MODEL = "models/embedding-001"
GENERATION_MODEL = "gemini-1.5-flash-latest"

async def find_relevant_reviews_with_pinecone(
    query: str,
    city: str,
    category: Optional[str] = None,
    top_k: int = 5
) -> List[Dict]:

    try:
        embed_response = genai.embed_content(
            model=EMBEDDING_MODEL,
            content=query,
            task_type="RETRIEVAL_QUERY"
        )
        query_embedding = embed_response['embedding']
    except Exception as e:
        print(f"Embedding generation failed: {e}")
        return []

    metadata_filter = {"city": city.lower()}
    if category:
        metadata_filter["category"] = category.lower()

    try:
        pinecone_results = pinecone_index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True, 
            filter=metadata_filter
        )
    except Exception as e:
        print(f"Pinecone query failed: {e}")
        return []

    location_ids_to_fetch = set()
    review_ids_map = {}

    for match in pinecone_results.get('matches', []):
        try:
            location_id, review_index_str = match['id'].split('#')
            review_index = int(review_index_str)

            location_ids_to_fetch.add(ObjectId(location_id))
            if location_id not in review_ids_map:
                review_ids_map[location_id] = []
            review_ids_map[location_id].append(review_index)
        except (ValueError, IndexError):
            continue

    if not location_ids_to_fetch:
        return []

    location_collection = await get_location_collection()
    retrieved_reviews = []

    cursor = location_collection.find({"_id": {"$in": list(location_ids_to_fetch)}})

    async for location in cursor:
        loc_id_str = str(location['_id'])
        for index_to_get in review_ids_map.get(loc_id_str, []):
            try:
                review = location['raw_reviews'][index_to_get]
                retrieved_reviews.append({
                    "location_name": location['name'],
                    "review_text": review['text'],
                    "author": review.get('author', 'N/A')
                })
            except (IndexError, KeyError):
                continue

    return retrieved_reviews

async def generate_conversational_response(
    user_query: str,
    city: str,
    category: Optional[str] = None,
    chat_history: List[Dict[str, str]] = []
) -> dict:

    context_reviews = await find_relevant_reviews_with_pinecone(
        query=f"{user_query} in {city}",
        city=city,
        category=category,
        top_k=10
    )

    system_prompt = f"""
        You are 'Vibe Navigator', a friendly, witty, and super knowledgeable friend who knows the city of {city} inside out.
        Your personality is casual, a bit poetic, and very enthusiastic.
        Your main goal is to help the user plan a great day out by recommending spots in a fun, storytelling format.

        **Your Instructions:**
        1. Use the chat history to understand the context of the conversation.
        2. Use the "Retrieved Evidence" from real user reviews as the factual basis for your recommendations. NEVER make up details about a place.
        3. If you make a recommendation, subtly weave in quotes or paraphrased points from the evidence.
        4. If the user asks a follow-up question, answer it based on the history and new evidence if available.
        5. Keep your responses conversational and engaging. Avoid just listing facts.
    """

    if context_reviews:
        evidence_str = "\n".join(
            [f"- From a review for '{r['location_name']}': \"{r['review_text']}\"" for r in context_reviews]
        )
        evidence_prompt = f"\n\n**Retrieved Evidence to use for your response:**\n{evidence_str}"
    else:
        evidence_prompt = "\n\n**Retrieved Evidence:**\nNo specific reviews found for this query. Rely on the chat history or general knowledge, but state that you couldn't find a specific vibe."

    full_prompt = system_prompt + evidence_prompt

    try:
        model = genai.GenerativeModel(GENERATION_MODEL, system_instruction=full_prompt)
        chat_session = model.start_chat(history=chat_history)
        response = await chat_session.send_message_async(user_query)
    except Exception as e:
        print(f"Gemini generation failed: {e}")
        return {
            "reply": "Sorry, I couldn't generate a response at this time.",
            "sources": context_reviews
        }

    return {
        "reply": response.text,
        "sources": context_reviews
    }


async def generate_tour_plan(city: str, vibe_tags: List[str]) -> dict:

    print(f"Generating tour plan for {city} with vibes: {vibe_tags}")
    
    candidate_locations = {}
    all_source_reviews = []
    
    for tag in vibe_tags:
        query = f"A place in {city} with a '{tag}' vibe"
        print(f"  > Retrieving candidates for vibe: '{tag}'")
        
        reviews = await find_relevant_reviews_with_pinecone(query=query, city=city, top_k=10)
        all_source_reviews.extend(reviews)
        
        for review in reviews:

            if review['location_name'] not in candidate_locations:
                candidate_locations[review['location_name']] = f"It has a '{tag}' vibe, as one review mentions: \"{review['review_text']}\""

    if not candidate_locations:
        return {"reply": "I'm sorry, I couldn't find enough spots with those vibes to build a tour. Try a different combination!", "sources": []}

    ingredients_str = "\n".join([f"- **{name}**: {reason}" for name, reason in candidate_locations.items()])

    prompt = f"""
            You are 'Vibe Navigator', a warm and enthusiastic AI city tour concierge who crafts personalized, story-driven day plans. Your personality is friendly, creative, and a bit poetic — like a passionate local friend who knows the city inside out.

            Users will select vibe tags like “aesthetic,” “quiet,” “lively,” or “nature-filled” to customize their experience. Your job is to weave those vibes into a compelling, natural narrative tour plan that flows through the day.

            **User's Selected Vibes:** {', '.join(vibe_tags)}

            **Available Locations to Choose From (Your Ingredients):**
            {ingredients_str}

            **How to Craft the Tour Plan:**

            1. **Tell a Story:** Don’t just list locations — create a vivid, engaging journey through the city. For example:  
            - “Start your morning soaking in the aesthetic charm of...”  
            - “For lunch, find a quiet spot at...”  
            - “As evening falls, feel the lively buzz of...”

            2. **Use the Ingredients:** Include at least 2-3 of the provided locations. Decide the best order to keep the narrative exciting and balanced.

            3. **Ground Your Recommendations:** For every spot you mention, weave in insights from real user reviews — quoting or paraphrasing them naturally to back up your suggestions.

            4. **Balance the Vibes:** If the selected vibes contrast (e.g., “quiet” and “lively”), create a plan that artfully balances those moods throughout the day.

            5. **Keep it Conversational:** Write as if you’re excitedly sharing a personalized itinerary with a friend — casual, upbeat, and warm.

            Your goal is to be the perfect GenAI concierge, blending creativity with authentic, review-backed recommendations to help users discover their perfect city vibe.

            Now, please generate the personalized tour plan based on the above instructions.
            """
    model = genai.GenerativeModel(GENERATION_MODEL)
    response = await model.generate_content_async(prompt)
    unique_sources = list({v['review_text']:v for v in all_source_reviews}.values())

    return {
        "reply": response.text,
        "sources": unique_sources
    }