require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const Redis = require("ioredis");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const proxy = require("express-http-proxy");

const logger = require("./utils/logger");
const errorHandler = require("./middleware/errorHandler-middleware");
const { authenticateToken } = require("./middleware/auth-middleware");

const app = express();
const port = process.env.PORT || 5000;
const redisClient = new Redis(process.env.REDIS_URL);

app.use(helmet());
app.use(cors());
app.use(express.json());

const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
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

app.use(rateLimiter);

// configuring proxy
const proxyOptions = {
  proxyReqPathResolver: (req) => {
    return req.originalUrl.replace(/^\/v1/, "/api");
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`proxy error ${err}`);
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  },
};

// setting up user service
app.use(
  "/v1/users",
  proxy(process.env.USER_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["content-type"] = "application/json";
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from user service : ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
  })
);

// setting up post service
app.use(
  "/v1/posts",
  authenticateToken,
  proxy(process.env.POST_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["content-type"] = "application/json";
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from post service : ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
  })
);

// setting up post service
app.use(
  "/v1/search",
  authenticateToken,
  proxy(process.env.SEARCH_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["content-type"] = "application/json";
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from post service : ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
  })
);

// setting up media service
app.use(
  "/v1/media",
  authenticateToken,
  proxy(process.env.MEDIA_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      if (
        srcReq.headers["content-type"] &&
        !srcReq.headers["content-type"].startsWith("multipart/form-data")
      ) {
        proxyReqOpts.headers["content-type"] = "application/json";
      }
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from media service : ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
    parseReqBody: false,
  })
);

app.use(errorHandler);

app.listen(port, () => {
  logger.info(`API Gateway is now running on ${port}`);
});
