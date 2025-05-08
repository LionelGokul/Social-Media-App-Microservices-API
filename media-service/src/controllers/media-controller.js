const Media = require("../models/media-model");
const { uploadMediaToCloudinary } = require("../utils/cloudinary");
const logger = require("../utils/logger");

const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      logger.warn("No file found");
      res.status(404).json({
        message: "No file found",
      });
    }

    const { originalname, mimetype, buffer } = req.file;

    const uploadedFile = await uploadMediaToCloudinary(req.file);
    const newMedia = new Media({
      publicId: uploadedFile.public_id,
      originalName: originalname,
      mimeType: mimetype,
      url: uploadedFile.secure_url,
      user: req.user.userId,
    });

    await newMedia.save();
    return res.status(201).json({
      media: newMedia.toObject(),
    });
  } catch (err) {
    logger.error("Couldnt upload media", err);
    res.status(500).json({
      message: "Internal server error.",
    });
  }
};

const getAllMedia = async (req, res) => {
  try {
    const medias = await Media.find({});
    return res.status(200).json({
      medias,
    });
  } catch (err) {
    logger.error("Error fetching medias", err);
    res.status(500).json({
      message: "Internal server error.",
    });
  }
};

const deleteMedia = async (req, res) => {
  try {
  } catch (err) {
    logger.error("Couldnt delete media", err);
    res.status(500).json({
      message: "Internal server error.",
    });
  }
};

module.exports = { uploadMedia, getAllMedia };
