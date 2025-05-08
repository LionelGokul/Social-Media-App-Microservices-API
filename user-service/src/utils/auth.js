const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const RefreshToken = require("../models/token-model");

const generateTokens = async (user) => {
  try {
    const accessToken = jwt.sign(
      {
        userId: user._id,
        userName: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "120m" }
    );

    const refreshToken = crypto.randomBytes(40).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 8);

    await RefreshToken.create({
      token: refreshToken,
      user: user._id,
      expiresAt,
    });

    return { accessToken, refreshToken };
  } catch (err) {
    throw err;
  }
};

module.exports = { generateTokens };
