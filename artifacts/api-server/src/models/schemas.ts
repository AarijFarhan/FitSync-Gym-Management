import { model, Schema } from "mongoose";

const tenant = { type: Schema.Types.ObjectId, ref: "Gym", required: true, index: true };

export const Gym = model("Gym", new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  plan: { type: String, enum: ["FREE", "PRO"], default: "FREE" },
  status: { type: String, enum: ["active", "suspended"], default: "active" },
  stripeCustomerId: String,
  stripeSubscriptionId: String,
}, { timestamps: true }));

export const User = model("User", new Schema({
  gymId: tenant,
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["super_admin", "gym_owner", "trainer", "member"], required: true },
}, { timestamps: true }));

export const Member = model("Member", new Schema({
  gymId: tenant,
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  trainerId: { type: Schema.Types.ObjectId, ref: "User" },
  goal: String,
  status: String,
}, { timestamps: true }));

export const Trainer = model("Trainer", new Schema({
  gymId: tenant,
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  specialty: String,
}, { timestamps: true }));

export const DietPlan = model("DietPlan", new Schema({
  gymId: tenant,
  memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
  title: String,
  calories: Number,
  days: Schema.Types.Mixed,
}, { timestamps: true }));

export const Subscription = model("Subscription", new Schema({
  gymId: tenant,
  stripeSubscriptionId: String,
  plan: String,
  status: String,
  currentPeriodEnd: Date,
}, { timestamps: true }));

export const Attendance = model("Attendance", new Schema({
  gymId: tenant,
  memberId: { type: Schema.Types.ObjectId, ref: "Member" },
  checkIn: Date,
  checkOut: Date,
  status: String,
}, { timestamps: true }));