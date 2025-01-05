const mongoose = require("mongoose");
// require("dotenv").config();
module.exports = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("mongodb running.... ^_^!");
  } catch (error) {
    console.error(error);
  }
};
