import redis from "../config/redis.js";
import { ragQuery } from "../services/ragService.js";
import { v4 as uuidv4 } from "uuid";

export async function startSession(req, res) {
  const sessionId = uuidv4();
  const ttl = Number(process.env.REDIS_TTL_SECONDS || 0);
  if (ttl > 0) {
    await redis.set(sessionId, JSON.stringify([]), 'EX', ttl);
  } else {
    await redis.set(sessionId, JSON.stringify([]));
  }
  res.json({ sessionId });
}

export async function sendMessage(req, res) {
  try {
    const { sessionId, message } = req.body;
    if (!sessionId || !message) {
      return res.status(400).json({ error: "Missing sessionId or message" });
    }

    const { answer, sources } = await ragQuery(message, 5);
    const reply = answer || "No relevant context found.";

    // Save conversation to Redis
    let history = JSON.parse(await redis.get(sessionId)) || [];
    history.push({ user: message, bot: reply, sources });
    const ttl = Number(process.env.REDIS_TTL_SECONDS || 0);
    if (ttl > 0) {
      await redis.set(sessionId, JSON.stringify(history), 'EX', ttl);
    } else {
      await redis.set(sessionId, JSON.stringify(history));
    }

    res.json({ reply, sources, history });
  } catch (err) {
    console.error("❌ sendMessage error:", err?.message || err);
    res.status(500).json({ error: err?.message || "Internal server error" });
  }
}

export async function getHistory(req, res) {
  const { sessionId } = req.params;
  const history = JSON.parse(await redis.get(sessionId)) || [];
  res.json({ history });
}

export async function clearSession(req, res) {
  const { sessionId } = req.params;
  await redis.del(sessionId);
  res.json({ message: "Session cleared" });
}
