import express from "express";
import bodyParser from "body-parser";
import { connect } from "amqplib";
import { v4 as uuidv4 } from "uuid";
import { writeFile, readFile } from "fs/promises";
import { existsSync } from "fs";

const queue = "rpc_queue";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = 3323;

async function saveToFile(data) {
  const completionDate = new Date();
  const formattedDate = `${completionDate.getDate()}-${
    completionDate.getMonth() + 1
  }-${completionDate.getFullYear()} ${completionDate.getHours()}:${completionDate.getMinutes()}:${completionDate.getSeconds()}`;

  const dataToSave = {
    completionDate: formattedDate,
    ...data,
  };

  if (!existsSync("logs.json")) {
    await writeFile("logs.json", JSON.stringify([dataToSave]), "utf-8");
  } else {
    const file = await readFile("logs.json", "utf-8");
    const fileData = JSON.parse(file);
    await writeFile("logs.json", JSON.stringify([dataToSave, ...fileData]));
  }
}

async function emitToQueue(data) {
  let connection;
  try {
    connection = await connect("amqp://localhost");
    const channel = await connection.createChannel();
    const correlationId = uuidv4();

    const requestOG = new Promise(async (resolve) => {
      const { queue: replyTo } = await channel.assertQueue("", {
        exclusive: true,
      });

      await channel.consume(
        replyTo,
        (message) => {
          if (!message) console.warn(" [x] Consumer cancelled");
          else if (message.properties.correlationId === correlationId) {
            resolve(message.content.toString());
          }
        },
        { noAck: true }
      );

      await channel.assertQueue(queue, { durable: false });
      console.log(" [x] Requesting link(%s)", data.toString());
      channel.sendToQueue(queue, Buffer.from(data.toString()), {
        correlationId,
        replyTo,
      });
    });

    const OGData = await requestOG;
    console.log(" [.] Got %s", OGData);
    return OGData;
  } catch (err) {
    console.warn(err);
  } finally {
    if (connection) await connection.close();
  }
}

app.get("/", (req, res) => {
  res.send("Use POST /read to read Open Graph data from a link");
});

app.post("/read", async (req, res) => {
  const { link } = req.body;

  let bodyLink = link;

  const regex = new RegExp(
    "^((https?|ftp|smtp):\\/\\/)?(www.)?[a-z0-9]+(\\.[a-z]{2,}){1,3}(#?\\/?.*)?$"
  );

  if (!regex.test(link)) {
    return res.status(400).json({ error: "Invalid link" });
  }

  if (!link.includes("http")) {
    bodyLink = `https://${link}`;
  }

  const data = await emitToQueue(bodyLink);

  const OGData = JSON.parse(data);

  const imageLinks = Object.keys(OGData).filter((key) => key.includes("image"));

  const images = imageLinks.map((link) => {
    return { type: link, image: OGData[link] };
  });

  await saveToFile({ link: bodyLink, title: OGData.title, images });

  res.json("Open Graph data saved to file");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
