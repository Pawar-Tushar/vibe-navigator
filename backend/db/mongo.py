import motor.motor_asyncio
from dotenv import load_dotenv
import os
load_dotenv()
MONGO_DB_URL = os.getenv("MONGO_DB_URL")

class DataBase:
    client: motor.motor_asyncio.AsyncIOMotorClient = None

db = DataBase()

async def get_location_collection():
    return db.client.vibe_navigator.get_collection("locations")

async def connect_to_mongo():
    print("Connecting to MongoDB...")
    db.client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DB_URL)
    print("Connection successful.")

async def close_mongo_connection():
    print("Closing MongoDB connection...")
    db.client.close()
    print("Connection closed.")