const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");
const fileupload = require("express-fileupload");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/error");

// LOAD ENV VARS
dotenv.config({ path: "./config/config.env" });

// CONNECT TO THE DATABASE
connectDB();

// ROUTES
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");
const users = require("./routes/users");
const reviews = require("./routes/reviews");

const port = process.env.PORT || 5000;

const app = express();

app.disable("x-powered-by");
// app.set("x-powered-by", "me");

// Necessary Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Dev Loggin middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Cookie Parser
app.use(cookieParser());

// sanitize data
app.use(mongoSanitize());

// File upload
app.use(fileupload());

// MOUNT ROUTERS
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);

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
