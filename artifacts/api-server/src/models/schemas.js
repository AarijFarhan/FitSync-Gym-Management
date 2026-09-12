import mongoose from "mongoose";

const { model, Schema } = mongoose;

// Every document carries a stable, human-readable string `id` (e.g. "mem_001")
// so the API responses keep the exact shape the web app expects. `id: false`
// disables Mongoose's default `_id` virtual so the stored `id` path wins.
const base = {
  id: { type: String, unique: true, required: true },
  gymId: { type: String, index: true },
};

export const Gym = model(
  "Gym",
  new Schema(
    {
      ...base,
      name: { type: String, required: true },
      slug: { type: String, required: true, unique: true },
      plan: { type: String, enum: ["FREE", "PRO"], default: "FREE" },
      status: { type: String, enum: ["active", "suspended"], default: "active" },
      members: Number,
      trainers: Number,
      mrr: Number,
      joined: String,
    },
    { timestamps: true, id: false },
  ),
);

export const User = model(
  "User",
  new Schema(
    {
      ...base,
      name: String,
      email: { type: String, required: true, unique: true },
      passwordHash: String,
      role: {
        type: String,
        enum: ["super_admin", "gym_owner", "trainer", "member"],
        required: true,
      },
      gymName: String,
      gymPlan: String,
      avatar: String,
    },
    { timestamps: true, id: false },
  ),
);

export const Member = model(
  "Member",
  new Schema(
    {
      ...base,
      name: String,
      email: String,
      goal: String,
      status: String,
      trainer: String,
      progress: Number,
      lastActive: String,
      joined: String,
      initials: String,
    },
    { timestamps: true, id: false },
  ),
);

export const Trainer = model(
  "Trainer",
  new Schema(
    {
      ...base,
      name: String,
      email: String,
      specialty: String,
      members: Number,
      status: String,
      initials: String,
    },
    { timestamps: true, id: false },
  ),
);

export const Attendance = model(
  "Attendance",
  new Schema(
    {
      ...base,
      member: String,
      date: String,
      checkIn: String,
      checkOut: String,
      status: String,
    },
    { timestamps: true, id: false },
  ),
);

export const DietPlan = model(
  "DietPlan",
  new Schema(
    {
      ...base,
      memberId: String,
      title: String,
      calories: Number,
      generatedAt: String,
      days: Schema.Types.Mixed,
    },
    { timestamps: true, id: false },
  ),
);

export const Workout = model(
  "Workout",
  new Schema(
    {
      ...base,
      name: String,
      type: String,
      scheduledFor: String,
      duration: Number,
      status: String,
      member: String,
    },
    { timestamps: true, id: false },
  ),
);

export const Subscription = model(
  "Subscription",
  new Schema(
    {
      ...base,
      stripeSubscriptionId: String,
      plan: String,
      status: String,
      currentPeriodEnd: Date,
    },
    { timestamps: true, id: false },
  ),
);