const Joi = require("joi");

const validateCreatePost = (data) => {
  const mediaSchema = Joi.array()
    .items(
      Joi.object({
        mediaId: Joi.string().hex().length(24).required(),
        publicId: Joi.string().required(),
        url: Joi.string().uri().required(),
      })
    )
    .optional();

  const schema = Joi.object({
    content: Joi.string().min(5).max(100).required(),
    userId: Joi.string().min(5).max(100).required(),
    media: mediaSchema,
    tags: Joi.array().items(Joi.string()).min(1).required(),
    comments: Joi.array().items(Joi.string()),
  });
  return schema.validate(data);
};

module.exports = {
  validateCreatePost,
};
