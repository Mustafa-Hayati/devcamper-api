const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/error");

// LOAD ENV VARS
dotenv.config({ path: "./config/config.env" });

// CONNECT TO THE DATABASE
connectDB();

// ROUTES
const bootcamps = require("./routes/bootcamps");

const port = process.env.PORT || 5000;

const app = express();

// Necessary Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dev Loggin middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// MOUNT ROUTERS
app.use("/api/v1/bootcamps", bootcamps);

// ERROR HANDLING MIDDLEWARE
// We should place this after routers
app.use(errorHandler);

const server = app.listen(port, () =>
  console.log(
    `✅ Server is running in ${process.env.NODE_ENV} mode on port ${port}`
  )
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`❌ Error: ${err.message}`);
  // close server and exit process
  server.close(() => process.exit(1));
});
