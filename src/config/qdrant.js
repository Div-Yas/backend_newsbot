import { QdrantClient } from "@qdrant/js-client-rest";

const client = new QdrantClient({
  url: process.env.QDRANT_URL,      // should be cloud URL
  apiKey: process.env.QDRANT_API_KEY,
  // Important: set checkCompatibility to false to skip version check for cloud
  checkCompatibility: false
});

export default client;
