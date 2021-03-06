//https://www.youtube.com/watch?v=GXokEYwbOwA :: 20:35

const jwt = require("jsonwebtoken");
require("dotenv").config();

const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const user = {
  id: 3,
  name: "madi",
  email: process.env.MAIL_USER,
  admin: true,
};

//---------generer un clef token-----------
function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1800s",
  });
}

function generateRefreshToken(user) {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "1y",
  });
}

//--------------route--------------
app.post("/api/login", (req, res) => {
  if (req.body.email !== user.email) {
    res.status(401).send("invalide");
    return;
  }
  if (req.body.password !== "zerat") {
    res.status(401).send("invalide");
    return;
  }

  const accessToken = generateAccessToken(user);
  const refreshedtoken = generateAccessToken(user);
  res.send({
    accessToken,
    refreshedtoken,
  });
});

//------------route refreshtoken-----------

app.post("/api/refreshtoken", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; //'Bearer aegfa"ezgf'

  if (!token) {
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(401);
    }

    delete user.iat;
    delete user.exp;

    const refreshedtoken = generateAccessToken(user);
    res.send({
      accessToken: refreshedtoken,
    });
  });
});

//-------------middleware---------------

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; //'Bearer aegfa"ezgf'

  if (!token) {
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(401);
    }
    req.user = user;
    next();
  });
}

app.get("/api/me", authenticateToken, (req, res) => {
  res.send(req.user);
});

//-----------serveur--------------
app.listen(3000, () => {
  console.log("serveur sur le port 3000");
});
