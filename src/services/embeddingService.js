import { GoogleGenerativeAI } from "@google/generative-ai";

// Single place to generate embeddings using Gemini API key auth
export const getEmbeddings = async (text) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return null; // skip empty content
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    const vector = result?.embedding?.values;
    if (!Array.isArray(vector)) {
      throw new Error("Invalid embedding response shape");
    }
    return vector.map((v) => Number(v));
  } catch (err) {
    console.error("❌ Embedding error:", err.message || err);
    return null;
  }
};
