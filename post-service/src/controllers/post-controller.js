const Post = require("../models/post-model");
const logger = require("../utils/logger");
const { publishEvent } = require("../utils/rabbitMQ");
const { invalidatePostCache } = require("../utils/redis");
const { validateCreatePost } = require("../utils/reqBodyValidator");

const createPost = async (req, res) => {
  try {
    const { error } = validateCreatePost(req.body);

    if (error) {
      logger.warn("Body validation error", error.details[0].message);
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const { comments, content, tags, media } = req.body;
    const newPost = new Post({
      user: req.body.userId,
      comments,
      content,
      tags,
      media: media || [],
    });
    await newPost.save();
    await publishEvent("post.created", {
      postId: newPost._id.toString(),
      userId: req.body.userId,
      content,
    });
    invalidatePostCache(req.redisClient, newPost._id.toString());
    return res.status(201).json({
      post: newPost,
      message: "Created Successfully",
    });
  } catch (err) {
    logger.error("Creating post failed", err);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const cacheKey = `posts:${page}:${limit}`;
    const cachedPosts = await req.redisClient.get(cacheKey);

    if (cachedPosts) {
      return res.json(JSON.parse(cachedPosts));
    }

    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const totalNoOfPosts = await Post.countDocuments();

    const result = {
      posts,
      currentpage: page,
      totalPages: Math.ceil(totalNoOfPosts / limit),
      totalPosts: totalNoOfPosts,
    };

    await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));

    return res.status(500).json({ ...result });
  } catch (err) {
    logger.error("Fetching posts failed", err);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const getPost = async (req, res) => {
  try {
    const postId = req.params.pid;
    const cachekey = `post:${postId}`;
    const cachedPost = await req.redisClient.get(cachekey);

    if (cachedPost) {
      return res.status(500).json({ post: cachedPost });
    }

    const postDetails = await Post.findById(postId);

    if (!postDetails) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    await req.redisClient.setex(cachekey, 3600, JSON.stringify(postDetails));

    return res.status(500).json({ post: postDetails });
  } catch (err) {
    logger.error("Fetching post failed", err);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.pid,
      user: req.body.userId,
    });

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const media = post.media.map((m) => ({
      mediaId: m.mediaId.toString(),
      publicId: m.publicId,
    }));
    await publishEvent("post.deleted", {
      postId: req.params.pid,
      userId: req.body.userId,
      media: media,
    });

    invalidatePostCache(req.redisClient, req.params.pid);
    return res.json({
      message: "Post deleted successfully",
    });
  } catch (err) {
    logger.error("Deleting post failed", err);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = { createPost, getAllPosts, getPost, deletePost };
