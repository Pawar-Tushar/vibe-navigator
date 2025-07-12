from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db.mongo import connect_to_mongo, close_mongo_connection 

from routers.vibes import router as vibe_router 

app = FastAPI(
    title="Vibe Navigator API",
    description="API for finding locations based on their vibe, powered by GenAI and a Pinecone-based RAG pipeline.",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://your-deployed-frontend-url.com"],
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()

app.include_router(vibe_router)

@app.get("/", tags=["Health Check"])
async def read_root():
    return {"status": "Vibe Navigator API is vibing!"}