import os
import json
import motor.motor_asyncio
from dotenv import load_dotenv
import google.generativeai as genai
from fastapi import BackgroundTasks
from typing import List

from .pinecone_indexer import index_locations 

load_dotenv(dotenv_path='../.env')

MONGO_DB_URL = os.getenv("MONGO_DB_URL")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not all([MONGO_DB_URL, GEMINI_API_KEY]):
    raise ValueError("One or more environment variables (Mongo, Gemini) are missing.")

genai.configure(api_key=GEMINI_API_KEY)
generation_model = genai.GenerativeModel("gemini-1.5-flash-latest")


REVIEWS_PER_BATCH = 30 

async def get_ai_response_as_json(prompt: str) -> dict:

    try:
        response = await generation_model.generate_content_async(prompt)
        json_text = response.text.strip().replace("```json", "").replace("```", "")
        return json.loads(json_text)
    except (json.JSONDecodeError, ValueError) as e:
        print(f"      - Warning: Could not parse LLM response as JSON. Error: {e}")
        return None
    except Exception as e:
        print(f"      - An unexpected error occurred calling the LLM: {e}")
        return None

async def analyze_locations(location_ids: List, background_tasks: BackgroundTasks):

    print(f"BACKGROUND TASK (2/3): Starting AI analysis for {len(location_ids)} locations.")
    mongo_client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DB_URL)
    collection = mongo_client.vibe_navigator.locations

    cursor = collection.find({"_id": {"$in": location_ids}})
    locations_to_process = await cursor.to_list(length=None)
    
    processed_ids_for_next_step = []

    for location in locations_to_process:
        print(f"\n  > Analyzing '{location['name']}' with {len(location['raw_reviews'])} reviews...")
        all_reviews = location['raw_reviews']
        
        partial_summaries = []
        print(f"    - Mapping reviews in batches of {REVIEWS_PER_BATCH}...")
        
        for i in range(0, len(all_reviews), REVIEWS_PER_BATCH):
            batch_reviews = all_reviews[i:i+REVIEWS_PER_BATCH]
            review_texts = "\n".join([f"- {r['text']}" for r in batch_reviews if r.get('text')])

            if not review_texts:
                continue

            map_prompt = f"""
                        Analyze the following batch of reviews for "{location['name']}".
                        Identify key themes, vibes, and standout points (e.g., "fast service", "great coffee", "noisy", "aesthetic decor").
                        Do not write a long summary. List the key points as a concise bulleted list.

                        Reviews:
                        {review_texts}

                        Key points from this batch:
                        """
            try:
                response = await generation_model.generate_content_async(map_prompt)
                partial_summaries.append(response.text)
                print(f"      - Processed batch {i//REVIEWS_PER_BATCH + 1}...")
            except Exception as e:
                print(f"      - Error processing a review batch for '{location['name']}': {e}")
                continue
        
        if not partial_summaries:
            print(f"     Could not generate any partial summaries for '{location['name']}'. Skipping analysis for this location.")
            continue

        print("    - Reducing partial summaries into a final Vibe Card...")
        combined_points = "\n".join(partial_summaries)

        reduce_prompt = f"""
                            You are a witty and insightful city guide. You have been given a list of key points summarized from different batches of reviews for a location.
                            Your task is to synthesize these points into a final, polished Vibe Card analysis.

                            Location Name: "{location['name']}"

                            Summarized Key Points from all reviews:
                            {combined_points}

                            Based ONLY on the key points provided, perform the following tasks and respond with ONLY a valid JSON object:
                            1.  **vibe_summary:** Write a final, playful, 1-2 sentence summary of the location's overall vibe.
                            2.  **vibe_tags:** Generate a final list of the 4-5 most important, one-word, lowercase tags.
                            3.  **emojis:** Choose 3 emojis that best represent the final vibe as a single string.

                            Your output MUST be a single JSON object. Example:
                            {{
                            "vibe_summary": "A bustling paradise for book lovers with mountains of books, though it can get a bit crowded. The smell of old paper is a treat!",
                            "vibe_tags": ["cozy", "crowded", "books", "treasure-hunt"],
                            "emojis": "📚❤️ bustling"
                            }}
                            """
        final_analysis = await get_ai_response_as_json(reduce_prompt)

        if final_analysis:
            await collection.update_one(
                {"_id": location["_id"]},
                {"$set": {"ai_analysis": final_analysis, "processing_status": "analyzed"}}
            )
            processed_ids_for_next_step.append(location["_id"])
            print(f"     Analysis complete for '{location['name']}'. Status set to 'analyzed'.")
        else:
            print(f"     Failed to generate final analysis for '{location['name']}'.")
    
    if processed_ids_for_next_step:
        print(f"\nAI analysis stage complete. Triggering Pinecone indexing for {len(processed_ids_for_next_step)} successfully analyzed locations.")
        background_tasks.add_task(index_locations, processed_ids_for_next_step)
    else:
        print("\nAI analysis stage complete. No locations were successfully analyzed to pass to the next stage.")
    
    mongo_client.close()