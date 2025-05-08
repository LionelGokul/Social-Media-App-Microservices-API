import Search from "../models/search-model";
import logger from "../utils/logger";

type createdPost = {
  postId: String;
  userId: String;
  content: String;
};

type deletedPost = {
  postId: String;
  userId: String;
  media: [
    {
      mediaId: String;
      publicId: String;
    }
  ];
};

export const handleCreatePost = async (message: createdPost) => {
  try {
    const newSearch = new Search({
      content: message.content,
      userId: message.userId,
      postId: message.postId,
    });
    await newSearch.save();
  } catch (err) {
    logger.error("error deleting media", err);
  }
};

export const handleDeletePost = async (message: deletedPost) => {
  try {
    await Search.findOneAndDelete({
      postId: message.postId,
    });
    logger.info(`${message.postId} deleted`);
  } catch (err) {
    logger.error("error deleting media", err);
  }
};
