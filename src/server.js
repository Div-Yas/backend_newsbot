import "dotenv/config";
import app from "./app.js";
import fetchNews from "../scripts/fetchNews.js";
// import { createCollection } from "./services/ragService.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
   // Call the fetchNews function
   await fetchNews();
  // await createCollection(); // ensure Qdrant collection exists
});