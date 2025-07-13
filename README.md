#  Vibe Navigator — Discover Your City’s Hidden Vibes

**Vibe Navigator** is an intelligent, city-exploration API that helps users uncover places matching specific vibes — aesthetic, nature-filled, lively, or quiet — using real-time scraped reviews from Google Maps and semantic search powered by **Google Gemini**, **Pinecone**, and **MongoDB**.

---

##  Overview

- **Scrapes Google Maps** for places across major Indian cities (Pune, Mumbai, Bangalore, Goa, Delhi, Noida).
- **Extracts reviews** and stores them in a MongoDB collection.
- **Embeds reviews** via Gemini's embedding model for semantic search.
- **Retrieves vibe-matching locations** using Pinecone vector similarity.
- **Generates natural-language responses and day plans** via Gemini 1.5 Flash.

---

##  Tech Stack

| Component        | Technology              |
|------------------|--------------------------|
| Web Scraping     | `Selenium`, `Google Maps` |
| Embedding        | `Google Gemini API`      |
| Vector DB        | `Pinecone`               |
| Database         | `MongoDB (Async)`        |
| Backend API      | `FastAPI`                |
| NLP Generation   | `Gemini 1.5 Flash`       |
| Deployment Ready |  Vercel / Render |

---

---

##  Core Features

### 1. Google Maps Scraper
- Dynamically searches for places like cafes, parks, bars, etc.
- Retrieves top 5 places per category and top 15 reviews per place.
- Extracts metadata: `name`, `address`, `lat/lon`, `review content`.

### 2. Embedding + Vector Search
- Embeds all reviews using Gemini’s `embedding-001` model.
- Stores vectors in Pinecone with metadata (`city`, `category`, etc.).
- Filters + retrieves top-K matching reviews for any natural query.

### 3. Conversational API (RAG)
- Answers user queries based on reviews from Pinecone.
- Never hallucinates facts — only responds from grounded data.
- Maintains conversation state using Gemini's chat session.

### 4. Tour Generation
- Users provide vibe tags like `"quiet"`, `"lively"`, etc.
- API crafts a story-driven itinerary from real places and reviews.
- Outputs a poetic, friendly tour plan like a local friend.

---
## Environment Setup

1. **Create a `.env` file** with the following variables:

```env
GEMINI_API_KEY=your_google_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=vibe-navigator
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/db
```

2. **Install dependencies:**

```bash
pip install -r requirements.txt
```
2. **Run the required Scripts:**

```bash
pip install -r requirements.txt
```
2. **Run the app:**

```bash
uvicorn main:app --reload
```
--- 
##  Deployment Tips

- Frontend hosted on Vercel
- Backend is easily containerizable with Docker.
- Pinecone region should match your nearest low-latency region.
- MongoDB Atlas is used for scalable document storage.

##  AI Ethics

- We do not hallucinate recommendations.
- All suggestions are grounded in real user reviews.
- No private data is scraped; only publicly available content is used.

##  Contributing

This is an early-stage proof-of-concept project. Contributions, feedback, or collaborations are warmly welcome!

## 📫 Contact

- Gmail: tusharpawar749963@gmail.com

##  Future Roadmap

-  City & category filters
-  Multi-modal vibe embedding (image + text)
-  Mobile app integration
-  Multilingual support (Hindi, Marathi, etc.)

## Thank You...


