const express = require("express");
const {
  createPost,
  getAllPosts,
  getPost,
  deletePost,
} = require("../controllers/post-controller");
const { authenticateRequest } = require("../middlewares/auth-middleware");

const router = express.Router();

// authenticate requests
router.use(authenticateRequest);

router.post("/", createPost);
router.get("/", getAllPosts);
router.get("/:pid", getPost);
router.delete("/:pid", deletePost);

module.exports = router;
