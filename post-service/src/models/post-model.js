const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    media: [
      {
        mediaId: { type: mongoose.Schema.Types.ObjectId },
        publicId: { type: String },
        url: { type: String },
      },
    ],
    isActive: { type: Boolean, required: true, default: true },
    comments: [{ type: String }],
    tags: [{ type: String, required: true }],
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
