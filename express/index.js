require("./passport");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const passport = require("./passport-middleware");
const error = require("./error");

const users = [{ userId: 1, name: "jonathan", stand: "the world" }];
const privateKey = "MY_PRIVATE_KEY";

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser());

const router = express.Router();

router.post("/auth/login", (req, res) => {
  console.log("new login");

  const user = users[0];

  const accessToken = jwt.sign(user, privateKey, {
    algorithm: "HS256",
    expiresIn: 60, // 1 นาที
  });

  const refreshToken = jwt.sign({ userId: user.userId }, privateKey, {
    algorithm: "HS256",
    expiresIn: "30d",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days,
    sameSite: "strict",
  });

  res.json({ accessToken });
});

router.get("/auth/refresh", (req, res) => {
  console.log("refresh token accept request");

  const cookie = req.cookies;
  const refreshToken = cookie?.refreshToken;

  const decodedToken = jwt.decode(refreshToken);

  const user = users.find((el) => el.userId === decodedToken?.userId);

  const accessToken = jwt.sign(user, privateKey, {
    algorithm: "HS256",
    expiresIn: 60,
  });

  res.json({ accessToken });
});

router.get("/auth/me", passport, (req, res) => {
  const { userId } = req.user;

  const user = users.find((el) => el.userId === userId);

  res.json(user);
});

router.get("/auth/logout", (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  // res.end();
  res.json({ message: "Logged out successfully" });
});

app.use(router);

app.use(error);

app.listen(8888);
