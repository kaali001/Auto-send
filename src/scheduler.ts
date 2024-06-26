import amqp from 'amqplib';
import 'dotenv/config';
import { categorizeEmail, generateResponse } from './openai';

const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

let channel: amqp.Channel | null = null;

// Function to add email tasks to the queue
export async function addEmailTask(emailContent: string) {
  if (!channel) {
    throw new Error('RabbitMQ channel is not initialized.');
  }
  const message = JSON.stringify({ emailContent });
  channel.sendToQueue('emailQueue', Buffer.from(message), { persistent: true });
  console.log('Email task added to queue');
}

async function start() {
  try {
    // Create a connection to the RabbitMQ server
    const connection = await amqp.connect(rabbitmqUrl);
    channel = await connection.createChannel();

    // Declare a queue to send messages
    const queue = 'emailQueue';
    await channel.assertQueue(queue, { durable: true });

    // Create a consumer to process messages from the queue
    channel.consume(
      queue,
      async (msg) => {
        if (msg !== null) {
          const job = JSON.parse(msg.content.toString());
          const { emailContent } = job;
          const category = await categorizeEmail(emailContent);
          const response = await generateResponse(emailContent);
          console.log(`Processed email with category: ${category} and response: ${response}`);

          // Acknowledge the message
          channel!.ack(msg);
        }
      },
      { noAck: false }
    );

    console.log(`Worker is listening for messages on ${queue}`);
  } catch (error) {
    console.error('Error connecting to RabbitMQ', error);
  }
}

start();

