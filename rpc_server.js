import { connect } from "amqplib";
import { fetch } from "fetch-opengraph";

const queue = "rpc_queue";

(async () => {
  try {
    const connection = await connect("amqp://localhost");
    const channel = await connection.createChannel();

    process.once("SIGINT", async () => {
      await channel.close();
      await connection.close();
    });

    await channel.assertQueue(queue, { durable: false });

    channel.prefetch(1);
    await channel.consume(queue, async (message) => {
      try {
        const link = message.content.toString();
        console.log(" [.] link: (%s)", link);
        const response = await fetch(link).catch((err) => {
          console.error(err);
          return;
        });
        console.log(" [.] response: ", response);
        channel.sendToQueue(
          message.properties.replyTo,
          Buffer.from(JSON.stringify(response)),
          {
            correlationId: message.properties.correlationId,
          }
        );
        channel.ack(message);
      } catch (err) {
        console.error(err);
      }
    });

    console.log(" [x] Awaiting RPC requests. To exit press CTRL+C.");
  } catch (err) {
    console.warn(err);
  }
})();
