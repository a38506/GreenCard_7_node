import mongoose from "mongoose";


// MongoDB
const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Database connected");
    });
    await mongoose.connect(`${process.env.MONGODB_URI}/GreenCart`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
  }
};

export default connectDB;
