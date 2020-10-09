const mongoose = require("mongoose");

const connectDB = async () => {
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

  const conn = await mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });

  console.log(`MongoDB: connected to Dev Camper DB!`);
  console.log(`${conn.connection.host}`);
};

module.exports = connectDB;
