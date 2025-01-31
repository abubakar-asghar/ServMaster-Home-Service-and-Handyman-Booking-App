import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

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

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is working on http://localhost:${process.env.PORT}`);
});

// Unhandled Promise Rejections
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the Server due to Unhandled Promise Rejections`);

  server.close(() => {
    process.exit(1);
  });
});
