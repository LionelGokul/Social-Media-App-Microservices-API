import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import mongoose from "mongoose";
import Redis from "ioredis";

import searchRouter from "./routes/search-routes";
import errorHandler from "./middleware/errorHandler-middleware";
import logger from "./utils/logger";
import { subscribeEvent } from "./utils/rabbitMQ";
import {
  handleCreatePost,
  handleDeletePost,
} from "./eventHandlers/search-eventHandler";

const mongoUri: string = process.env.MONGODB_URI ?? "";
if (!mongoUri) {
  logger.error("MONGODB_URI is not defined");
  process.exit(1);
}
mongoose
  .connect(mongoUri)
  .then(() => logger.info("Connected to DB"))
  .catch((e) => logger.error("MongoDB Connection Error", e));

const app = express();
const port: number = parseInt(process.env.PORT ?? "5001", 10);

app.use(helmet());
app.use(cors());
app.use(express.json());

const redisUrl: string = process.env.REDIS_URL ?? "";
if (!redisUrl) {
  logger.error("REDIS_URL is not defined");
  process.exit(1);
}
const redisClient = new Redis(redisUrl);

app.use(
  "/api/search",
  (req: Request, res: Response, next: NextFunction) => {
    req.redisClient = redisClient;
    next();
  },
  searchRouter
);

app.use(errorHandler);

app.listen(port, async () => {
  try {
    await subscribeEvent("post.created", handleCreatePost);
    await subscribeEvent("post.deleted", handleDeletePost);
    logger.info(`Search Service running on port: ${port}`);
  } catch (err) {
    logger.error(`Error: ${err}`);
    process.exit(1);
  }
});

process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  logger.error("Unhandled rejection at", promise, "reason:", reason);
});
