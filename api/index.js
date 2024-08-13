import express from "express";
import mongoose from "mongoose";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import dotenv from "dotenv";
dotenv.config();

mongoose

  .connect(process.env.MONGO) // This is to hide our URL connecting to our application database from the public in the env file.
  .then(() => {
    console.log("connection successful");
  })
  .catch((error) => {
    console.log("database connection unsuccessful: ", error);
  });

// Initialize express application
const app = express();

app.use(express.json());

// Create a server and choose a porta
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
