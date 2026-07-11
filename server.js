import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { configDotenv } from "dotenv";
import userRoute from "./routes/userRoute.js";

configDotenv();
const app = express();
app.use(express.json());

app.use(
  cors({
    origin:["http://localhost:5174/auth",
      "https://usmilitary-frontend-2.vercel.app"],
     methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

// Routes
app.use("/api/auth", userRoute);

app.get("/", (req, res) => {
  res.send("API IS WORKING FINE!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {});
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};
connectDB();
