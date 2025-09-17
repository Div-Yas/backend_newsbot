import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chatRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import redis from "./config/redis.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/chat", chatRoutes);
app.use("/api/news", newsRoutes);
app.get("/", async (req, res) => {
  try {
    await redis.ping();
    res.send("✅ Server & Redis are healthy!");
  } catch (e) {
    res.status(500).send("❌ Redis not responding");
  }
});


export default app;
