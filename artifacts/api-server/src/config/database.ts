import mongoose from "mongoose";
import { logger } from "../lib/logger";

let connectionAttempted = false;

export async function connectMongo() {
  if (connectionAttempted || !process.env.MONGO_URI) return;
  connectionAttempted = true;
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 2500,
    });
    logger.info("MongoDB connection established");
  } catch (error) {
    logger.warn({ err: error }, "MongoDB unavailable; FitSync is running in demo mode");
  }
}