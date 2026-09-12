import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectMongo } from "./config/database.js";
import { Gym, User } from "./models/schemas.js";

async function seed() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required to seed MongoDB");
  }
  await connectMongo();
  await Promise.all([Gym.deleteMany({}), User.deleteMany({})]);
  const gym = await Gym.create({
    name: "Karachi Strength & Fitness",
    slug: "karachi-strength-fitness",
    plan: "PRO",
    status: "active",
  });
  const passwordHash = await bcrypt.hash("demo1234", 10);
  await User.insertMany([
    { gymId: gym._id, name: "Hamza Ahmed", email: "owner@fitsync.demo", passwordHash, role: "gym_owner" },
    { gymId: gym._id, name: "Usman Ali", email: "trainer@fitsync.demo", passwordHash, role: "trainer" },
    { gymId: gym._id, name: "Hira Malik", email: "member@fitsync.demo", passwordHash, role: "member" },
  ]);
  await mongoose.disconnect();
}

void seed();
