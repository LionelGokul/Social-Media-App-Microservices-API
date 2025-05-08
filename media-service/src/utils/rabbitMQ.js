const amqp = require("amqplib");
const logger = require("./logger");
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

const subscribeEvent = async (routingKey, callback) => {
  try {
    if (!channel) await connectRabbitMQ();

    const { queue } = channel.assertQueue("", { exclusive: true });
    await channel.bindQueue(queue, exchangeName, routingKey);
    channel.consume(queue, (msg) => {
      if (msg) {
        const content = JSON.parse(msg.content.toString());
        callback(content);
        channel.ack(msg);
      }
    });
    logger.info(`event subscribed: ${routingKey}`);
  } catch (err) {
    logger.error("rabbitmq subscribe error", err);
    throw err;
  }
};

module.exports = { connectRabbitMQ, publishEvent, subscribeEvent };
