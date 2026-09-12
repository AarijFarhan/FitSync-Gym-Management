import mongoose from "mongoose";
import { logger } from "../lib/logger.js";
import { seedIfNeeded } from "../data/repository.js";

let connectionAttempted = false;

export async function connectMongo() {
  if (connectionAttempted) return mongoose.connection.readyState === 1;
  connectionAttempted = true;

  if (!process.env.MONGO_URI) {
    logger.warn("MONGO_URI not set; running in memory demo mode");
    return false;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    const result = await seedIfNeeded();
    logger.info({ seed: result }, "MongoDB connection established");
    return true;
  } catch (error) {
    logger.warn(
      { err: error },
      "MongoDB unavailable; FitSync is running in demo mode",
    );
    return false;
  }
}

export function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}