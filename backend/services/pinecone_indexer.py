import os
import asyncio
import motor.motor_asyncio
from dotenv import load_dotenv
import google.generativeai as genai
from pinecone import Pinecone
from typing import List

load_dotenv(dotenv_path='../.env')

MONGO_DB_URL = os.getenv("MONGO_DB_URL")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY") 
PINECONE_INDEX_NAME = "vibe-navigator"

if not all([MONGO_DB_URL, GEMINI_API_KEY, PINECONE_API_KEY, PINECONE_INDEX_NAME]):
    raise ValueError("One or more environment variables (Mongo, Gemini, Pinecone) are missing.")

genai.configure(api_key=GEMINI_API_KEY)
pc = Pinecone(api_key=PINECONE_API_KEY)
pinecone_index = pc.Index(PINECONE_INDEX_NAME)

EMBEDDING_MODEL = "models/embedding-001"

async def index_locations(location_ids: List):

    print(f"BACKGROUND TASK (3/3): Starting Pinecone indexing for {len(location_ids)} locations.")
    mongo_client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DB_URL)
    collection = mongo_client.vibe_navigator.locations

    cursor = collection.find({"_id": {"$in": location_ids}})
    locations_to_process = await cursor.to_list(length=None)
    
    if not locations_to_process:
        print("  - No locations found for the given IDs. Ending indexing task.")
        return

    vectors_to_process = []
    
    for location in locations_to_process:
        location_id_str = str(location['_id'])
        for review_index, review in enumerate(location.get("raw_reviews", [])):
            review_text = review.get("text")
            if not review_text or len(review_text.split()) < 5:
                continue
            
            vector_id = f"{location_id_str}#{review_index}"

            vectors_to_process.append({
                "id": vector_id,
                "text": review_text
            })

    if not vectors_to_process:
        print("  - No valid reviews found in the provided locations. Ending indexing task.")
        return
        
    print(f"  > Found {len(vectors_to_process)} total reviews to embed and index. Processing in batches...")

    batch_size = 100 
    for i in range(0, len(vectors_to_process), batch_size):
        batch = vectors_to_process[i:i+batch_size]
        texts_to_embed = [item['text'] for item in batch]
        
        try:
            response = genai.embed_content(
                model=EMBEDDING_MODEL,
                content=texts_to_embed,
                task_type="RETRIEVAL_DOCUMENT"
            )
            embeddings = response['embedding']

            pinecone_vectors = []
            for j, item in enumerate(batch):
                pinecone_vectors.append({
                    "id": item['id'],
                    "values": embeddings[j],
                    
                })

            pinecone_index.upsert(vectors=pinecone_vectors)
            print(f"    - Upserted batch {i//batch_size + 1} to Pinecone.")

        except Exception as e:
            print(f"    -  An error occurred during batch {i//batch_size + 1} processing: {e}")
            continue

    await collection.update_many(
        {"_id": {"$in": location_ids}},
        {"$set": {"processing_status": "indexed"}}
    )
    print(f"   Status for {len(location_ids)} locations updated to 'indexed' in MongoDB.")
    print(" PIPELINE COMPLETE: New locations are now fully live and searchable.")
    
    mongo_client.close()