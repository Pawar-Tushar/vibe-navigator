import motor.motor_asyncio
import json
import os
import asyncio
from dotenv import load_dotenv

load_dotenv(dotenv_path='../.env')

MONGO_DB_URL = os.getenv("MONGO_DB_URL")
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent
JSON_FILE_PATH = BASE_DIR / "scraper" / "data.json"
async def seed_database():

    if not MONGO_DB_URL:
        print("ERROR: MONGO_DB_URL not found in .env file.")
        return

    print("Connecting to MongoDB...")
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DB_URL)
    db = client.vibe_navigator 
    collection = db.locations  

    print(f"Clearing existing data from '{collection.name}' collection...")
    await collection.delete_many({})

    print(f"Loading data from {JSON_FILE_PATH}...")
    try:
        with open(JSON_FILE_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
            print("DEBUG - Loaded data:", json.dumps(data, indent=2))
    except FileNotFoundError:
        print(f"ERROR: {JSON_FILE_PATH} not found. Make sure you've run the scraper first.")
        return
    except json.JSONDecodeError:
        print(f"ERROR: Could not decode JSON from {JSON_FILE_PATH}. Check if the file is valid.")
        return

    if not data:
        print("No data to seed.")
        return

    print(f"Inserting {len(data)} documents into the database...")
    await collection.insert_many(data)

    print("✅ Database seeding complete!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())