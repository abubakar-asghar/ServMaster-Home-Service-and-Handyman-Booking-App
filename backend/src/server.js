import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import serverless from "serverless-http";

// Handling Uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the Server due toUncaught Exception`);

  process.exit(1);
});

// Config
dotenv.config({ path: "src/.env" });

// Database Connection
connectDB();

app.get("/", (req, res) => {
  res.send("Server is working!");
});

const server = app.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server running at http://localhost:${process.env.PORT}`);
});

// Unhandled Promise Rejections
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the Server due to Unhandled Promise Rejections`);

  server.close(() => {
    process.exit(1);
  });
});
