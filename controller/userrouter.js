const express = require("express");

const user_router = express.Router();

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const { createClient } = require("redis");

require("dotenv").config();

const client = createClient({ url: process.env.REDIS });

client.on("error", (err) => console.log("Redis Client Error", err));

const { UserModel } = require("../model/usermodel.js");

user_router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  const hashed = bcrypt.hashSync(password, 8);

  const user = await UserModel({ name, email, password: hashed });

  user.save();

  res.send("Signup successfull");
});

user_router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) return res.send("user not present");

    const isPasswordCorrect = await bcrypt.compareSync(password, user.password);

    if (!isPasswordCorrect) return res.send("Invalid Credentials");

    const token = await jwt.sign({ userId: user._id }, process.env.JWT, {
      expiresIn: "6hr",
    });

    res.send({ message: "login successfull", token });
  } catch (error) {
    res.send(error.message);
  }
});

user_router.get("/logout", async (req, res) => {
  try {
    const token = req.headers?.authorization?.split(" ")[1];
    if (!token) return res.send("please login first");

    await client.connect();
    await client.set("token", token);

    res.send("logout successfull");
  } catch (error) {
    res.send(error.message);
  }
});

module.exports = {
  user_router,
};
