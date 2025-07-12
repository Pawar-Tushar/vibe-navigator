import motor.motor_asyncio
import os
import asyncio
from dotenv import load_dotenv
import google.generativeai as genai
from pinecone import Pinecone
load_dotenv()

# --- Config ---
MONGO_DB_URL = os.getenv("MONGO_DB_URL")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
PINECONE_API_KEY = "pcsk_ZiKWB_3uDnGmhzaPaeDVijA7jLe6LiyahFfffkoqu3gEWRQGjffiaGfwiYordzc4rnKQd"
PINECONE_INDEX_NAME = "vibe-navigator"
EMBEDDING_MODEL = "models/embedding-001"

# --- Initialize Clients ---
genai.configure(api_key=GEMINI_API_KEY)
pc = Pinecone(api_key=PINECONE_API_KEY)
pinecone_index = pc.Index(PINECONE_INDEX_NAME)

async def embed_and_index():
    """
    Reads all reviews from MongoDB, generates embeddings,
    and upserts them into our Pinecone index.
    """
    mongo_client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DB_URL)
    collection = mongo_client.vibe_navigator.locations

    print("Fetching reviews from MongoDB...")
    cursor = collection.find({}, {"_id": 1, "raw_reviews.text": 1})
    
    vectors_to_upsert = []
    
    async for location in cursor:
        location_id = str(location['_id'])
        for review_index, review in enumerate(location.get("raw_reviews", [])):
            review_text = review.get("text")
            if not review_text or len(review_text.split()) < 5:
                continue
            
            # This is the unique ID we will use in Pinecone
            vector_id = f"{location_id}#{review_index}"

            # We'll generate embeddings in batches later
            vectors_to_upsert.append({
                "id": vector_id,
                "text": review_text
            })

    if not vectors_to_upsert:
        print("No new reviews to index.")
        return
        
    print(f"Found {len(vectors_to_upsert)} reviews to process. Generating embeddings...")

    batch_size = 100 # Gemini API batch limit
    for i in range(0, len(vectors_to_upsert), batch_size):
        batch = vectors_to_upsert[i:i+batch_size]
        texts_to_embed = [item['text'] for item in batch]
        
        # Generate embeddings
        response = genai.embed_content(
            model=EMBEDDING_MODEL,
            content=texts_to_embed,
            task_type="RETRIEVAL_DOCUMENT"
        )
        embeddings = response['embedding']
        print(embeddings)
        # Prepare vectors for Pinecone upsert
        pinecone_vectors = []
        for j, item in enumerate(batch):
            pinecone_vectors.append({
                "id": item['id'],
                "values": embeddings[j],
                # Pinecone metadata must be simple key-value pairs
                # We don't store the text here, just the ID to retrieve it from Mongo
            })

        # Upsert the batch to Pinecone
        pinecone_index.upsert(vectors=pinecone_vectors)
        print(f"  > Upserted batch {i//batch_size + 1} to Pinecone.")

    print("✅ Pinecone indexing complete!")
    print(f"   Total vectors in index: {pinecone_index.describe_index_stats()['total_vector_count']}")

if __name__ == "__main__":
    asyncio.run(embed_and_index())