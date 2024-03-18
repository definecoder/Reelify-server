const mongoose = require("mongoose");
const dbUrl = process.env.MONGO_URI;

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("Connected to database!");
  })
  .catch((error) => {
    console.log("Connection failed!", error);
    process.exit();
  });
