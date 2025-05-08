const logger = require("../utils/logger");

const authenticateRequest = (req, res, next) => {
  const userId = req.headers["x-user-id"];
  console.log(userId);

  if (!userId) {
    logger.warn("Unauthorised Access without user ID");
    return res.status(401).json({
      message: "Unauthorised Access",
    });
  }

  req.user = { userId };
  next();
};

module.exports = { authenticateRequest };
