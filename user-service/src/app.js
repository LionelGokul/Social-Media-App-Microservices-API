require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const Redis = require("ioredis");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const userRoutes = require("./routes/user-routes");
const errorHandler = require("./middleware/errorHandler-middleware");

const logger = require("./utils/logger");

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
const rateLimiterRedis = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "rate-limiter",
  points: 5,
  duration: 1,
});

app.use((req, res, next) => {
  rateLimiterRedis
    .consume(req.ip)
    .then(() => next())
    .catch((e) => {
      logger.warn("Rate Limit Exceeded", req);
      res.status(429).statusMessage("Too Many Requests!!!");
    });
});

const sensitiveEndpointLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn("Sensitive endpoint rate limit exceeded", req);
    res.status(429).send("Too Many Requests!!!");
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

app.use(sensitiveEndpointLimiter);

app.use("/api/users", userRoutes);

app.use(errorHandler);

app.listen(port, () => {
  logger.info(`User Service running on port:${port}`);
});

// unhandled promise rejection
process.on("unhandledRejection", (reason, promise) => {
  logger.error("unhandled rejection at ", promise, "reason:", reason);
});
