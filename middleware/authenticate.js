const { createClient } = require("redis");

require("dotenv").config();

const client = createClient({ url: process.env.REDIS });

client.on("error", (err) => console.log("Redis Client Error", err));

const jwt = require("jsonwebtoken");

const authenticate = async (req, res, next) => {
  const token = req.headers?.authorization?.split(" ")[1];
  if (!token) res.send("please login first");

  const isToken = jwt.verify(token, process.env.JWT);

  if (!isToken) res.send("please login");
  await client.connect();
  const red_token = await client.get("token");

  await client.disconnect();

  if (!red_token) {
    next();
  } else if (red_token == token) {
    res.send("please login again");
  }

  next();
};

module.exports = {
  authenticate,
};
