import amqp from "amqplib";
import type { ConsumeMessage } from "amqplib";

import logger from "./logger";

let conn: any = null;
let channel: any = null;
const exchangeName = "social_events";

const ensureChannel = async (): Promise<any> => {
  if (channel) return channel;

  const url = process.env.RABBITMQ_URL;
  if (!url) {
    logger.error("RABBITMQ_URL is not defined");
    throw new Error("RABBITMQ_URL is not defined");
  }

  conn = await amqp.connect(url);
  channel = await conn.createChannel();
  await channel.assertExchange(exchangeName, "topic", { durable: false });
  logger.info("Connected to RabbitMQ");
  return channel;
};

export const publishEvent = async (
  routingKey: string,
  message: unknown
): Promise<void> => {
  const ch = await ensureChannel();
  ch.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(message)));
  logger.info(`Event published: [${routingKey}] ${JSON.stringify(message)}`);
};

export const subscribeEvent = async <T = unknown>(
  routingKey: string,
  callback: (msg: T) => void
): Promise<void> => {
  const ch = await ensureChannel();
  const asserted = await ch.assertQueue("", { exclusive: true });
  await ch.bindQueue(asserted.queue, exchangeName, routingKey);
  await ch.consume(asserted.queue, (msg: ConsumeMessage | null) => {
    if (msg) {
      const content = JSON.parse(msg.content.toString()) as T;
      callback(content);
      ch.ack(msg);
    }
  });
  logger.info(`Subscribed to events: ${routingKey}`);
};
