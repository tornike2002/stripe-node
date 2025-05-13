import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import stripeRoutes from "./routes/stripe";
import subscriptionRoutes from "./routes/subscriptions";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/stripe", stripeRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

export default app;
