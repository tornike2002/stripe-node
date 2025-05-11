import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db";
import app from "./server";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
  });
};

startServer();
