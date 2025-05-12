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
  res.send("API is working!");
});

const handler = serverless(app);
export default handler;

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

// // Unhandled Promise Rejections
// process.on("unhandledRejection", (err) => {
//   console.log(`Error: ${err.message}`);
//   console.log(`Shutting down the Server due to Unhandled Promise Rejections`);

//   server.close(() => {
//     process.exit(1);
//   });
// });
