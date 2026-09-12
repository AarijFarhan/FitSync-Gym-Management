import mongoose from "mongoose";
import { connectMongo } from "./config/database.js";
import { seedIfNeeded } from "./data/repository.js";
import { logger } from "./lib/logger.js";

async function seed() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required to seed MongoDB");
  }
  const connected = await connectMongo();
  if (!connected) {
    throw new Error("Could not connect to MongoDB; seed aborted");
  }
  const result = await seedIfNeeded({ force: true });
  logger.info({ seed: result }, "Database reseeded");
  await mongoose.disconnect();
}

void seed();