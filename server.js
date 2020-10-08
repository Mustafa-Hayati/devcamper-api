const express = require("express");
const dotenv = require("dotenv");

// LOAD ENV VARS
dotenv.config({ path: "./config/config.env" });

const port = process.env.PORT || 5000;

const app = express();

app.get("/", (req, res) => {
  res.status(200).send("Hello");
});

app.listen(port, () =>
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${port}`
  )
);
