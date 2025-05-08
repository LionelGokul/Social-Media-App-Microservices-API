const Joi = require("joi");

const validateSignUp = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(5).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });
  return schema.validate(data);
};

const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });
  return schema.validate(data);
};

const validateGenerateRefreshToken = (data) => {
  const schema = Joi.object({
    refreshToken: Joi.string().required(),
  });
  return schema.validate(data);
};

module.exports = {
  validateSignUp,
  validateLogin,
  validateGenerateRefreshToken,
};
