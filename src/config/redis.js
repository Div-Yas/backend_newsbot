import Redis from "ioredis";

const rawUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
// Normalize localhost to 127.0.0.1 to avoid IPv6 (::1) issues on some setups
const redisUrl = rawUrl.startsWith("redis://localhost")
	? rawUrl.replace("localhost", "127.0.0.1")
	: rawUrl;

const useTLS = redisUrl.startsWith("rediss://");

const redis = new Redis(redisUrl, {
	tls: useTLS ? {} : undefined,
	maxRetriesPerRequest: null,
	retryStrategy: (times) => Math.min(200 + times * 200, 2000),
	reconnectOnError: () => true,
	keepAlive: 10000,
});

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("ready", () => console.log("✅ Redis ready"));
redis.on("error", (err) => console.error("❌ Redis error:", err.message));
redis.on("close", () => console.log("❌ Redis connection closed"));
redis.on("reconnecting", () => console.log("🔄 Redis reconnecting"));

export default redis;
