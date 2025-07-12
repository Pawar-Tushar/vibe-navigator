import motor.motor_asyncio
import os
import asyncio
from dotenv import load_dotenv
import google.generativeai as genai
from pinecone import Pinecone
from bson import ObjectId

load_dotenv()

# --- Config ---
MONGO_DB_URL = os.getenv("MONGO_DB_URL")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")  # Store in .env for safety
PINECONE_INDEX_NAME = "vibe-navigator"
EMBEDDING_MODEL = "models/embedding-001"

# --- Initialize Clients ---
genai.configure(api_key=GEMINI_API_KEY)
pc = Pinecone(api_key=PINECONE_API_KEY)
pinecone_index = pc.Index(PINECONE_INDEX_NAME)

async def embed_and_index():
    """
    Reads reviews from MongoDB, generates embeddings, attaches metadata,
    and upserts them into Pinecone — RAG ready.
    """
    mongo_client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DB_URL)
    collection = mongo_client.vibe_navigator.locations

    print("📦 Fetching reviews from MongoDB...")
    cursor = collection.find({}, {
        "_id": 1,
        "name": 1,
        "city": 1,
        "category": 1,
        "ai_analysis.vibe_tags": 1,
        "raw_reviews.text": 1
    })

    vectors_to_upsert = []

    async for location in cursor:
        location_id = str(location['_id'])
        location_name = location.get("name", "Unknown Location")
        city = location.get("city", "unknown").lower()
        category = location.get("category", "misc").lower()
        tags = location.get("ai_analysis", {}).get("vibe_tags", [])

        for review_index, review in enumerate(location.get("raw_reviews", [])):
            review_text = review.get("text", "").strip()
            if not review_text or len(review_text.split()) < 5:
                continue

            vector_id = f"{location_id}#{review_index}"

            vectors_to_upsert.append({
                "id": vector_id,
                "text": review_text,
                "metadata": {
                    "location_id": location_id,
                    "location_name": location_name,
                    "city": city,
                    "category": category,
                    "tags": tags
                }
            })

    if not vectors_to_upsert:
        print("⚠️ No valid reviews found.")
        return

    print(f"🧠 Generating embeddings for {len(vectors_to_upsert)} reviews...")

    batch_size = 100
    for i in range(0, len(vectors_to_upsert), batch_size):
        batch = vectors_to_upsert[i:i + batch_size]
        texts = [item["text"] for item in batch]

        try:
            response = genai.embed_content(
                model=EMBEDDING_MODEL,
                content=texts,
                task_type="RETRIEVAL_DOCUMENT"
            )
            embeddings = response["embedding"]

            pinecone_vectors = []
            for j, item in enumerate(batch):
                pinecone_vectors.append({
                    "id": item["id"],
                    "values": embeddings[j],
                    "metadata": item["metadata"]  # 🔥 Attached metadata
                })

            pinecone_index.upsert(vectors=pinecone_vectors)
            print(f"  ✅ Upserted batch {i//batch_size + 1}")

        except Exception as e:
            print(f"❌ Embedding failed for batch {i//batch_size + 1}: {e}")

    # ✅ Re-ranking is not done here directly — it's used at query time (explained below)
    stats = pinecone_index.describe_index_stats()
    print("🎉 Indexing complete. Total vectors:", stats["total_vector_count"])

if __name__ == "__main__":
    asyncio.run(embed_and_index())
