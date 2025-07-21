import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// MongoDB
const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Database connected");
    });
    await mongoose.connect(`${process.env.MONGODB_URI}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
  }
};

export default connectDB;
