// src/config/redis.js
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL, {
  retryStrategy: (times) => Math.min(times * 100, 2000), // retry with backoff
});

let connected = false;

redis.on("connect", () => {
  if (!connected) {
    console.log("✅ Redis connected");
    connected = true;
  }
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err.message);
  connected = false;
});

export default redis;
