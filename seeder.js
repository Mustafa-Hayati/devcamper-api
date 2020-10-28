const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config/config.env" });

// LOAD MODELS
const Bootcamp = require("./models/Bootcamp");
const Course = require("./models/Course");
const User = require("./models/User");

// Connect to DB
let DB;
if (process.env.NODE_ENV === "production") {
  // ! MongoDB Atlas
  DB = process.env.DATABASE.replace(
    "<PASSWORD>",
    process.env.DATABASE_PASSWORD
  );
} else {
  // ! Local Database
  DB = process.env.DATABASE_LOCAL;
}

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ connected"));

// READ JOSN FILES
const bootcamps = JSON.parse(
  fs.readFileSync(
    `${__dirname}/_data/Bootcamps.json`,
    "utf-8"
  )
);

const courses = JSON.parse(
  fs.readFileSync(
    `${__dirname}/_data/Courses.json`,
    "utf-8"
  )
);

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/Users.json`, "utf-8")
);

// Import into DB
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    await User.create(users);
    console.log("✅ Data imported");
    process.exit();
  } catch (error) {
    console.error(`❌`, err);
  }
};

// Delete Data
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    await User.deleteMany();

    console.log("✅ Data Deleted");
    process.exit();
  } catch (error) {
    console.error(`❌`, err);
  }
};

if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
}
