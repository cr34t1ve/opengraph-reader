import express from "express";
import bodyParser from "body-parser";

const app = express();

// use body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = 3323;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/read", async (req, res) => {
  const { link } = req.body;

  // check against regex
  const regex = new RegExp(
    "^((https?|ftp|smtp):\\/\\/)?(www.)?[a-z0-9]+(\\.[a-z]{2,}){1,3}(#?\\/?.*)?$"
  );

  if (!regex.test(link)) {
    return res.status(400).json({ error: "Invalid link" });
  }

  res.json(link);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
