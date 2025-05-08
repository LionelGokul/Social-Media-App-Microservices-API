const Cloudinary = require("cloudinary").v2;

const logger = require("../utils/logger");

Cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Social media App

const uploadMediaToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = Cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        folder: "Social media App",
      },
      (err, result) => {
        if (err) {
          logger.error("error uploading file", err);
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(file.buffer);
  });
};

const deleteMedia = async (publicId) => {
  try {
    const result = Cloudinary.uploader.destroy(publicId);
    return result;
  } catch (err) {
    logger.error("error deleting file", err);
    throw err;
  }
};

module.exports = { uploadMediaToCloudinary, deleteMedia };
