require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const Redis = require("ioredis");
const postRoutes = require("./routes/post-route");
const errorHandler = require("./middlewares/errorHandler-middleware");

const logger = require("./utils/logger");
const { connectRabbitMQ } = require("./utils/rabbitMQ");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info("connected to DB"))
  .catch((e) => logger.error("MongoDB Connection Error", e));

const app = express();
const port = process.env.PORT || 5001;
app.use(helmet());
app.use(cors());
app.use(express.json());

const redisClient = new Redis(process.env.REDIS_URL);

app.use(
  "/api/posts",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  postRoutes
);

app.use(errorHandler);

app.listen(port, async () => {
  try {
    await connectRabbitMQ();
    logger.info(`Post Service running on port:${port}`);
  } catch (err) {
    logger.error(`Error:${err}`);
    process.exit(1);
  }
});

// unhandled promise rejection
process.on("unhandledRejection", (reason, promise) => {
  logger.error("unhandled rejection at ", promise, "reason:", reason);
});
