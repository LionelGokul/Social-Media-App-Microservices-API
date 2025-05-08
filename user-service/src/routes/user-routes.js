const express = require("express");
const {
  signUp,
  generateRefreshToken,
  login,
  logout,
} = require("../controllers/user-controller");

const router = express.Router();

router.post("/sign-up", signUp);
router.post("/login", login);
router.delete("/refresh-tokens/:refreshToken", logout);
router.post("/refresh-tokens", generateRefreshToken);

module.exports = router;
