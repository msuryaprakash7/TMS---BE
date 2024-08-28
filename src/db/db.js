const mongoose = require("mongoose");

require('dotenv').config();
const connectDB = async () => {
  if (!process.env.MONGO_URL) {
    console.error("MongoDB connection string is not defined.");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("-----> MongoDB Database Connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

// Gracefully handle process termination
process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing MongoDB connection');
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = connectDB;
