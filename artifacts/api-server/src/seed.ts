import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectMongo } from "./config/database";
import { Gym, User } from "./models/schemas";

async function seed() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required to seed MongoDB");
  }
  await connectMongo();
  await Promise.all([Gym.deleteMany({}), User.deleteMany({})]);
  const gym = await Gym.create({
    name: "Northstar Athletics",
    slug: "northstar-athletics",
    plan: "PRO",
    status: "active",
  });
  const passwordHash = await bcrypt.hash("demo1234", 10);
  await User.insertMany([
    { gymId: gym._id, name: "Jordan Ellis", email: "owner@fitsync.demo", passwordHash, role: "gym_owner" },
    { gymId: gym._id, name: "Alex Rivera", email: "trainer@fitsync.demo", passwordHash, role: "trainer" },
    { gymId: gym._id, name: "Sam Okafor", email: "member@fitsync.demo", passwordHash, role: "member" },
  ]);
  await mongoose.disconnect();
}

void seed();