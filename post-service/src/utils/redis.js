const invalidatePostCache = async (redisClient, postID) => {
  const cachedKey = `post:${postID}`;
  await redisClient.del(cachedKey);

  const keys = await redisClient.keys("posts:*");
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};

module.exports = { invalidatePostCache };
