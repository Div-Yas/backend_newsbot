import qdrant from "../config/qdrant.js";
import { getEmbeddings } from "../services/embeddingService.js";

const COLLECTION_NAME = "news_articles";

export const ingestArticles = async (req, res) => {
  try {
    const { articles } = req.body;
    if (!articles || !Array.isArray(articles)) {
      return res.status(400).json({ error: "Missing or invalid articles array" });
    }

    const points = await Promise.all(
      articles.map(async (article, idx) => {
        const title = article.title || "";
        const content = article.content || "";
        const combined = `${title}\n\n${content}`.trim();
        const embedding = await getEmbeddings(combined);
        if (!embedding) return null;
        return {
          id: idx + 1,
          vector: embedding,
          payload: {
            title: article.title,
            url: article.url,
            content: combined,
          },
        };
      })
    ).then(arr => arr.filter(Boolean));

    console.log(`Ingesting ${points.length} articles`);
    if (points.length === 0) {
      return res.status(500).json({ error: "No embeddings generated for provided articles" });
    }
    // Ensure collection exists with correct vector size
    const vectorSize = points[0].vector.length;
    try {
      await qdrant.getCollection(COLLECTION_NAME);
    } catch (_) {
      await qdrant.createCollection(COLLECTION_NAME, {
        vectors: { size: vectorSize, distance: "Cosine" }
      });
    }

    await qdrant.upsert(COLLECTION_NAME, { points });
    res.json({ status: "success", ingested: points.length });
  } catch (err) {
    console.error("Ingestion error:", err); // Log full error
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
};
