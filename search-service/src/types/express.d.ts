import type Redis from "ioredis";

declare global {
  namespace Express {
    interface Request {
      redisClient: Redis;
    }
  }
  interface Error {
    status?: number;
  }
}
