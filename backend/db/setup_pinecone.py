import os
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv

load_dotenv()
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
# print(PINECONE_API_KEY)
PINECONE_ENVIRONMENT = "df"
PINECONE_INDEX_NAME = "vibe-navigator" 

def create_pinecone_index():

    if not all([PINECONE_API_KEY, PINECONE_ENVIRONMENT]):
        print("ERROR: Pinecone API Key or Environment not found in .env file.")
        return
        
    pc = Pinecone(api_key=PINECONE_API_KEY)

    if PINECONE_INDEX_NAME in pc.list_indexes().names():
        print(f" Pinecone index '{PINECONE_INDEX_NAME}' already exists. No action needed.")
        return

    print(f" Creating Pinecone index '{PINECONE_INDEX_NAME}'...")
    
    pc.create_index(
        name=PINECONE_INDEX_NAME,
        dimension=768,  
        metric='cosine', 
        spec=ServerlessSpec(
            cloud='aws',
            region='us-east-1' 
        )
    )
    print(" Pinecone index created successfully.")

if __name__ == "__main__":
    create_pinecone_index()