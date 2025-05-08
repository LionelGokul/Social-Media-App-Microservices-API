const amqp = require("amqplib");
const logger = require("../utils/logger");
const { json } = require("express");

let conn = null;
let channel = null;

const exchangeName = "social_events";

const connectRabbitMQ = async () => {
  try {
    conn = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await conn.createChannel();
    await channel.assertExchange(exchangeName, "topic", { durable: false });
    logger.info("connected to rabbitmq");
    return channel;
  } catch (err) {
    logger.error("rabbitmq conn error", err);
    throw err;
  }
};

const publishEvent = async (routingKey, message) => {
  try {
    if (!channel) await connectRabbitMQ();

    channel.publish(
      exchangeName,
      routingKey,
      Buffer.from(JSON.stringify(message))
    );
    logger.info(`event published: ${message} ${routingKey}`);
  } catch (err) {
    logger.error("rabbitmq message error", err);
    throw err;
  }
};

module.exports = { connectRabbitMQ, publishEvent };
