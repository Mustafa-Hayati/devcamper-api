const express = require("express");
const dotenv = require("dotenv");
// ROUTES
const bootcamps = require("./routes/bootcamps");

// LOAD ENV VARS
dotenv.config({ path: "./config/config.env" });

const port = process.env.PORT || 5000;

const app = express();

// MOUNT ROUTERS
app.use("/api/v1/bootcamps", bootcamps);

app.listen(port, () =>
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${port}`
  )
);
