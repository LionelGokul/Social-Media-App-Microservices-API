const logger = require("../utils/logger");
const User = require("../models/user-model");
const Token = require("../models/token-model");
const {
  validateLogin,
  validateSignUp,
  validateGenerateRefreshToken,
} = require("../utils/reqBodyValidator");
const { generateTokens } = require("../utils/auth");

const signUp = async (req, res) => {
  try {
    const { error } = validateSignUp(req.body);

    if (error) {
      logger.warn("Body validation error", error.details[0].message);
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const { email, name, password } = req.body;

    let user = await User.findOne({ email: email }).lean();
    if (user) {
      logger.warn("User Already Exists.");
      return res.status(400).json({
        message: "User Already Exists.",
      });
    }

    user = new User({ email, name, password });
    await user.save();
    user = user.toObject();

    delete user.password;

    const { accessToken, refreshToken } = await generateTokens(user);

    res.status(201).json({
      message: "User Signed Up Sucessfully",
      user,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    logger.error("Sign Up failed", err),
      res.status(500).json({
        message: "Internal Server Error",
      });
  }
};

const login = async (req, res) => {
  try {
    const { error } = validateLogin(req.body);

    if (error) {
      logger.warn("Body validation error", error.details[0].message);
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const { email, password } = req.body;

    let user = await User.findOne({ email: email });
    if (!user) {
      logger.warn("Couldn't find an user for the given email.");
      return res.status(404).json({
        message: "Couldn't find an user for the given email.",
      });
    }
    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      logger.warn("Incorrect password.");
      return res.status(401).json({
        message: "Incorrect password.",
      });
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    res.status(200).json({
      message: "User Logged in Sucessfully",
      user,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.log(err);
    logger.error("Login failed", err),
      res.status(500).json({
        message: "Internal Server Error.",
      });
  }
};

const generateRefreshToken = async (req, res) => {
  try {
    const { error } = validateGenerateRefreshToken(req.body);

    if (error) {
      logger.warn("Body validation error", error.details[0].message);
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    let token = await Token.findOne({ token: req.body.refreshToken })
      .populate("user")
      .lean()
      .exec();
    if (!token || token.expiresAt < new Date()) {
      logger.warn("Invalid or expired token.");
      return res.status(404).json({
        message: "Invalid or expired token.",
      });
    }
    const { accessToken, refreshToken } = await generateTokens(token.user);

    await Token.deleteOne({ _id: token._id });

    return res.status(200).json({
      message: "Token generated successfully.",
      accessToken,
      refreshToken,
    });
  } catch (err) {
    logger.error("Token generation failed", err);
    res.status(500).json({
      message: "Internal Server Error.",
    });
  }
};

const logout = async (req, res) => {
  try {
    await Token.deleteOne({ token: req.params.refreshToken });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    logger.error("Token generation failed", err);
    res.status(500).json({
      message: "Internal Server Error.",
    });
  }
};

module.exports = { signUp, login, generateRefreshToken, logout };
