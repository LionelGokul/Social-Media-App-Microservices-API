const logger = require("../utils/logger");

const authenticateRequest = (req, res, next) => {
  const userId = req.headers["x-user-id"];

  if (!userId) {
    logger.warn("Unauthorised Access without user ID");
    return res.status(401).json({
      message: "Unauthorised Access",
    });
  }

  req.body.userId = userId;
  next();
};

module.exports = { authenticateRequest };
