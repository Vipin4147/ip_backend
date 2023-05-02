const { connection } = require("./config/db.js");

const express = require("express");

const { user_router } = require("./controller/userrouter.js");

const { authenticate } = require("./middleware/authenticate.js");

const { logger } = require("./middleware/logger.js");

const { createClient } = require("redis");

require("dotenv").config();

const client = createClient({ url: process.env.REDIS });

client.on("error", (err) => console.log("Redis Client Error", err));

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome this is home page");
});

app.get("/city/:ip", authenticate, async (req, res) => {
  // GET https://ipapi.co/{ip}/{format}/

  let ip = req.params.ip;
  await client.connect();
  let don = await client.get("ip");
  if (don) res.send(don);

  let data = await fetch(`https://ipapi.co/${ip}/city/json/`);
  console.log(data);

  await client.set("ip", data, "EX:1000*60*6");
  res.send(data);
});

app.use("/user", user_router);

app.listen(5100, async () => {
  try {
    await connection;
    console.log("connected to db");
  } catch (error) {
    console.log(error);
  }
  console.log("running at 5100");
});
