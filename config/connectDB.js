const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    mongoose.connection.on('connected', () => {
      console.log("Connected to MongoDB");
    });

    mongoose.connection.on('error', (error) => {
      console.error("MongoDB connection error:", error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log("Disconnected from MongoDB");
    });

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

module.exports = connectDB;
