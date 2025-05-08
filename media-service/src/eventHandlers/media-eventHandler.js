const Media = require("../models/media-model");
const { deleteMedia } = require("../utils/cloudinary");
const logger = require("../utils/logger");

const handleDeletePost = async (message) => {
  try {
    for (const media of message.media) {
      await deleteMedia(media.publicId);
      await Media.findByIdAndDelete(media.mediaId);
      logger.info(`deleting media :${media}`);
    }
  } catch (err) {
    logger.error("error deleting media", err);
  }
};

module.exports = { handleDeletePost };
