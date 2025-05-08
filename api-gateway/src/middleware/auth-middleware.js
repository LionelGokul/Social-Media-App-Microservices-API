const logger = require("../utils/logger");
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeaders = req.headers["authorization"];

  const token = authHeaders && authHeaders.split(" ")[1];
  if (!token) {
    logger.warn("No auth token.");
    return res.status(401).json({
      message: "No auth token.",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn("Invalid auth token");
      return res.status(401).json({
        message: "Invalid auth token",
      });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
