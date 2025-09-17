import { GoogleGenerativeAI } from "@google/generative-ai";
import qdrant from "../config/qdrant.js";
import { getEmbeddings } from "./embeddingService.js";

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const COLLECTION_NAME = process.env.QDRANT_COLLECTION || "news_articles";

async function ensureCollection(vectorSize) {
  try {
    await qdrant.getCollection(COLLECTION_NAME);
  } catch (_) {
    await qdrant.createCollection(COLLECTION_NAME, {
      vectors: { size: vectorSize, distance: "Cosine" }
    });
  }
}

export async function ragQuery(queryText, topK = 5) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  const queryVector = await getEmbeddings(queryText);
  if (!Array.isArray(queryVector)) {
    throw new Error("Failed to create query embedding");
  }

  await ensureCollection(queryVector.length);

  const search = await qdrant.search(COLLECTION_NAME, {
    vector: queryVector,
    limit: topK,
    with_payload: true
  });
  console.log("🔎 Qdrant search hits:", Array.isArray(search) ? search.length : 0);

  const contexts = (search || [])
    .map((pt) => pt?.payload?.content)
    .filter(Boolean)
    .slice(0, topK);

  const systemPrompt = `You are a helpful news assistant. Answer concisely using the provided context. If the context does not contain the answer, say you are not sure.`;
  const prompt = `${systemPrompt}\n\nContext:\n${contexts.join("\n\n---\n\n")}\n\nUser: ${queryText}`;

  // Instantiate client at call time to ensure env is loaded
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const result = await model.generateContent(prompt);
  return {
    answer: result.response.text(),
    sources: (search || []).map((pt) => ({ title: pt?.payload?.title, url: pt?.payload?.url })).slice(0, topK)
  };
}
