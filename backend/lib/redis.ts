// Redis client disabled - using in-memory fallback
// This eliminates all Redis connection errors when Redis is not installed

class RedisClient {
  public isConnected: boolean = false;

  constructor() {
    // Redis is disabled - app will work without caching
    console.log('Redis disabled - app running without cache');
  }

  async connect() {
    // No-op: Redis disabled
    return null;
  }

  async get(key: string) {
    // No-op: Redis disabled, return null (cache miss)
    return null;
  }

  async set(key: string, value: any, expireInSeconds?: number) {
    // No-op: Redis disabled
    return null;
  }

  async del(key: string) {
    // No-op: Redis disabled
    return null;
  }

  async exists(key: string) {
    // No-op: Redis disabled
    return 0;
  }

  async disconnect() {
    // No-op: Redis disabled
  }
}

export const redisClient = new RedisClient();