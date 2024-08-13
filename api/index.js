import express from "express";
import mongoose from "mongoose";
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

const app = express();

app.listen(3000, () => {
  console.log("Server is running on port 3000!!");
});
