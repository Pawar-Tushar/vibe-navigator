import os
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv

load_dotenv()
PINECONE_API_KEY = "pcsk_ZiKWB_3uDnGmhzaPaeDVijA7jLe6LiyahFfffkoqu3gEWRQGjffiaGfwiYordzc4rnKQd"
print(PINECONE_API_KEY)
PINECONE_ENVIRONMENT = "df"
PINECONE_INDEX_NAME = "vibe-navigator" # Let's name our index

def create_pinecone_index():
    """
    Connects to Pinecone and creates a new index if it doesn't already exist.
    """
    if not all([PINECONE_API_KEY, PINECONE_ENVIRONMENT]):
        print("ERROR: Pinecone API Key or Environment not found in .env file.")
        return
        
    pc = Pinecone(api_key=PINECONE_API_KEY)

    # Check if the index already exists
    if PINECONE_INDEX_NAME in pc.list_indexes().names():
        print(f"🌲 Pinecone index '{PINECONE_INDEX_NAME}' already exists. No action needed.")
        return

    print(f"🌲 Creating Pinecone index '{PINECONE_INDEX_NAME}'...")
    
    # Create the index
    pc.create_index(
        name=PINECONE_INDEX_NAME,
        dimension=768,  # This MUST match your embedding model's dimensions (Gemini's is 768)
        metric='cosine', # Cosine similarity is best for text embeddings
        spec=ServerlessSpec(
            cloud='aws', # Or 'gcp'. Choose one.
            region='us-east-1' # Choose a region.
        )
    )
    print("✅ Pinecone index created successfully.")

if __name__ == "__main__":
    create_pinecone_index()