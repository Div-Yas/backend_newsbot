# RAG Chatbot Backend (Node.js + Express)

## Tech Stack
- Express (REST API)
- Google Gemini: `@google/generative-ai` (chat + `text-embedding-004`)
- Vector DB: Qdrant (`@qdrant/js-client-rest`)
- Cache: Redis (`ioredis`)
- Ingestion: RSS via `axios` + `xml2js`

## Setup
1) Prereqs: Node 18+, Redis, Qdrant
2) Create .env:
GEMINI_API_KEY=your_google_ai_studio_key
GEMINI_MODEL=gemini-1.5-flash
REDIS_URL=redis://127.0.0.1:6379
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=
QDRANT_COLLECTION=news_articles
PORT=5000
# Optional: Redis TTL for session history (seconds)
REDIS_TTL_SECONDS=3600
3) Install and run:
npm install
npm run dev

## Ingestion (~50 articles)
node scripts/fetchNews.js
- Fetches several NYT RSS feeds, trims to 50, embeds title+content, upserts to Qdrant.
- Auto-creates the collection with correct vector size and cosine distance.

## API
- POST /api/chat/session → { sessionId }
- POST /api/chat/message { sessionId, message } → { reply, sources, history }
- GET  /api/chat/history/:sessionId → { history }
- DELETE /api/chat/session/:sessionId → { message }

## RAG Flow
1. Query → Gemini embeddings (`text-embedding-004`)
2. Qdrant search (top-k, cosine)
3. Prompt Gemini (`gemini-1.5-flash`) with retrieved context
4. Return answer + sources; store {user, bot, sources} in Redis[sessionId]

## Caching & Performance
- Session history in Redis; enable expiry with REDIS_TTL_SECONDS.
- Cache warming idea: validate Qdrant on boot; optionally pre-embed frequent queries and cache.

## Troubleshooting
- 403: Use an AI Studio API key (not Cloud OAuth). Remove app restrictions on the key.
- If ingestion says “No embeddings generated”, ensure GEMINI_API_KEY is set in the same shell.
