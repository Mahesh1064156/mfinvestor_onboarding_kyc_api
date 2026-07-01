import express from "express";
import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';


app.use(express.json());

app.get("/api", (req, res) => {
  res.json({
    message: "API is running",
  });
});

const startServer = async () => {
  console.log("hi ")
  await connectDB();
  app.listen(env.port, () => console.log(`Server running on port ${env.port}`));
};

startServer().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
