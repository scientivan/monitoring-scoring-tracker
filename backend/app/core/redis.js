const Redis = require("ioredis");

const REDIS_URL = process.env.REDIS_URL || "redis://redis:6379";

const client = new Redis(REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  retryStrategy: (times) => Math.min(times * 200, 2000),
});

let isReady = false;

client.on("ready", () => {
  isReady = true;
  console.log("[redis] connected:", REDIS_URL);
});

client.on("end", () => {
  isReady = false;
});

client.on("error", (error) => {
  isReady = false;
  console.warn("[redis] connection error:", error.message);
});

const connectPromise = client.connect().catch((error) => {
  console.warn("[redis] initial connection failed:", error.message);
});

async function ensureConnected() {
  if (isReady) {
    return;
  }

  await connectPromise;

  if (isReady) {
    return;
  }

  try {
    await client.connect();
  } catch (error) {
    throw new Error(`Redis is unavailable: ${error.message}`);
  }
}

function buildLockValue() {
  return `${process.pid}:${Date.now()}:${Math.random().toString(16).slice(2)}`;
}

async function acquireLock(key, ttlMs) {
  await ensureConnected();

  const value = buildLockValue();
  const result = await client.set(key, value, "PX", ttlMs, "NX");

  if (result !== "OK") {
    return null;
  }

  return value;
}

async function releaseLock(key, value) {
  if (!isReady || !value) {
    return false;
  }

  const releaseScript = `
    if redis.call("GET", KEYS[1]) == ARGV[1] then
      return redis.call("DEL", KEYS[1])
    end
    return 0
  `;

  const result = await client.eval(releaseScript, 1, key, value);
  return result === 1;
}

module.exports = {
  client,
  acquireLock,
  releaseLock,
};
