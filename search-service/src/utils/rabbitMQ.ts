import amqp from "amqplib";
import type { ConsumeMessage } from "amqplib";

import logger from "./logger";

let conn: any = null;
let channel: any = null;
const exchangeName = "social_events";

const MAX_RETRIES = 10;
const RETRY_DELAY = 2000;

const ensureChannel = async (): Promise<any> => {
  if (channel) return channel;

  let connectionErr: Error | null = null;
  for (let i = 1; i <= MAX_RETRIES; i++) {
    try {
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
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      connectionErr = error;
      console.warn(
        `RabbitMQ connect ${i}/${MAX_RETRIES} failed; retrying in ${RETRY_DELAY}ms`
      );
      await new Promise((r) => setTimeout(r, RETRY_DELAY));
    }
  }
  logger.error(
    "Failed to connect to RabbitMQ after multiple attempts",
    connectionErr
  );
  throw connectionErr ?? new Error("Unknown RabbitMQ connection error");
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
