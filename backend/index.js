import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/connectDB.js";
import authRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // allow to parse incoming req.body
app.use(cookieParser()); // allow to parse incoming cookies
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on ${PORT}`);
});
