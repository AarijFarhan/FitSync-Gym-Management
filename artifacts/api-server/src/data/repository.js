import mongoose from "mongoose";
import {
  Attendance,
  DietPlan,
  Gym,
  Member,
  Trainer,
  User,
  Workout,
} from "../models/schemas.js";
import {
  attendance as demoAttendance,
  demoUsers,
  dietPlans as demoDietPlans,
  gyms as demoGyms,
  members as demoMembers,
  trainers as demoTrainers,
  workouts as demoWorkouts,
} from "./demo-data.js";

const ready = () => mongoose.connection.readyState === 1;

// In-memory fallback used when MongoDB is not configured/available.
const mem = {
  gyms: demoGyms.map((g) => ({ ...g })),
  users: demoUsers.map((u) => ({ ...u })),
  members: demoMembers.map((m) => ({ ...m })),
  trainers: demoTrainers.map((t) => ({ ...t })),
  attendance: demoAttendance.map((a) => ({ ...a })),
  workouts: demoWorkouts.map((w) => ({ ...w })),
  dietPlans: JSON.parse(JSON.stringify(demoDietPlans)),
};

function toApi(doc) {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  delete obj._id;
  delete obj.__v;
  return obj;
}

// ---------------------------------------------------------------------------
// Seeding
// ---------------------------------------------------------------------------

export async function seedIfNeeded({ force = false } = {}) {
  if (!ready()) return "memory";
  const existing = await Gym.estimatedDocumentCount();
  if (existing > 0 && !force) return "existing";

  if (force && existing > 0) {
    await Promise.all([
      Attendance.deleteMany({}),
      DietPlan.deleteMany({}),
      Workout.deleteMany({}),
      Member.deleteMany({}),
      Trainer.deleteMany({}),
      User.deleteMany({}),
      Gym.deleteMany({}),
    ]);
  }

  await Gym.insertMany(demoGyms);
  await User.insertMany(demoUsers);
  await Member.insertMany(demoMembers);
  await Trainer.insertMany(demoTrainers);
  await Attendance.insertMany(demoAttendance);
  await Workout.insertMany(demoWorkouts);
  await DietPlan.insertMany(demoDietPlans);

  return force ? "reseeded" : "seeded";
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function findUserByEmail(email) {
  if (ready()) {
    const user = await User.findOne({ email }).lean();
    return user ? toApi(user) : undefined;
  }
  const user = mem.users.find((u) => u.email === email);
  return user ? { ...user } : undefined;
}

export async function findUserById(id) {
  if (ready()) {
    const user = await User.findOne({ id }).lean();
    return user ? toApi(user) : undefined;
  }
  const user = mem.users.find((u) => u.id === id);
  return user ? { ...user } : undefined;
}

export async function updateUserPlan(id, gymPlan) {
  if (ready()) {
    await User.updateOne({ id }, { $set: { gymPlan } });
    return findUserById(id);
  }
  const user = mem.users.find((u) => u.id === id);
  if (user) user.gymPlan = gymPlan;
  return user ? { ...user } : undefined;
}

// ---------------------------------------------------------------------------
// Gyms
// ---------------------------------------------------------------------------

export async function listGyms() {
  if (ready()) {
    const rows = await Gym.find().sort({ createdAt: 1 }).lean();
    return rows.map(toApi);
  }
  return mem.gyms.map((g) => ({ ...g }));
}

export async function getGym(id) {
  if (ready()) {
    const gym = await Gym.findOne({ id }).lean();
    return gym ? toApi(gym) : undefined;
  }
  const gym = mem.gyms.find((g) => g.id === id);
  return gym ? { ...gym } : undefined;
}

export async function updateGym(gymId, patch) {
  if (ready()) {
    await Gym.updateOne({ id: gymId }, { $set: patch });
    return getGym(gymId);
  }
  const gym = mem.gyms.find((g) => g.id === gymId);
  if (gym) Object.assign(gym, patch);
  return gym ? { ...gym } : undefined;
}

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

export async function listMembers({ gymId, search } = {}) {
  const query = gymId ? { gymId } : {};
  if (ready()) {
    const filter = { ...query };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const rows = await Member.find(filter).sort({ createdAt: -1 }).lean();
    return rows.map(toApi);
  }
  let rows = mem.members.filter((m) => !gymId || m.gymId === gymId);
  if (search) {
    rows = rows.filter((m) =>
      `${m.name} ${m.email}`.toLowerCase().includes(search),
    );
  }
  return rows.map((m) => ({ ...m }));
}

export async function getMember(id, gymId) {
  const query = { id };
  if (gymId) query.gymId = gymId;
  if (ready()) {
    const member = await Member.findOne(query).lean();
    return member ? toApi(member) : undefined;
  }
  const member = mem.members.find(
    (m) => m.id === id && (!gymId || m.gymId === gymId),
  );
  return member ? { ...member } : undefined;
}

export async function countMembers(gymId) {
  if (ready()) {
    return Member.countDocuments({ gymId });
  }
  return mem.members.filter((m) => m.gymId === gymId).length;
}

export async function createMember(data) {
  if (ready()) {
    const doc = await Member.create(data);
    return toApi(doc);
  }
  const copy = { ...data };
  mem.members.push(copy);
  return { ...copy };
}

// ---------------------------------------------------------------------------
// Trainers
// ---------------------------------------------------------------------------

export async function listTrainers({ gymId } = {}) {
  if (ready()) {
    const filter = gymId ? { gymId } : {};
    const rows = await Trainer.find(filter).sort({ createdAt: -1 }).lean();
    return rows.map(toApi);
  }
  return mem.trainers
    .filter((t) => !gymId || t.gymId === gymId)
    .map((t) => ({ ...t }));
}

export async function countTrainers(gymId) {
  if (ready()) {
    return Trainer.countDocuments({ gymId });
  }
  return mem.trainers.filter((t) => t.gymId === gymId).length;
}

export async function createTrainer(data) {
  if (ready()) {
    const doc = await Trainer.create(data);
    return toApi(doc);
  }
  const copy = { ...data };
  mem.trainers.push(copy);
  return { ...copy };
}

// ---------------------------------------------------------------------------
// Attendance
// ---------------------------------------------------------------------------

export async function listAttendance({ gymId } = {}) {
  if (ready()) {
    const filter = gymId ? { gymId } : {};
    const rows = await Attendance.find(filter).sort({ createdAt: -1 }).lean();
    return rows.map(toApi);
  }
  return mem.attendance
    .filter((a) => !gymId || a.gymId === gymId)
    .map((a) => ({ ...a }));
}

export async function createAttendance(data) {
  if (ready()) {
    const doc = await Attendance.create(data);
    return toApi(doc);
  }
  const copy = { ...data };
  mem.attendance.unshift(copy);
  return { ...copy };
}

// ---------------------------------------------------------------------------
// Diet plans
// ---------------------------------------------------------------------------

export async function listDietPlans({ gymId } = {}) {
  if (ready()) {
    const filter = gymId ? { gymId } : {};
    const rows = await DietPlan.find(filter).sort({ createdAt: -1 }).lean();
    return rows.map(toApi);
  }
  return mem.dietPlans
    .filter((p) => !gymId || p.gymId === gymId)
    .map((p) => ({ ...p }));
}

export async function createDietPlan(data) {
  if (ready()) {
    const doc = await DietPlan.create(data);
    return toApi(doc);
  }
  const copy = JSON.parse(JSON.stringify(data));
  mem.dietPlans.unshift(copy);
  return { ...copy };
}

// ---------------------------------------------------------------------------
// Workouts
// ---------------------------------------------------------------------------

export async function listWorkouts({ gymId } = {}) {
  if (ready()) {
    const filter = gymId ? { gymId } : {};
    const rows = await Workout.find(filter).sort({ createdAt: -1 }).lean();
    return rows.map(toApi);
  }
  return mem.workouts
    .filter((w) => !gymId || w.gymId === gymId)
    .map((w) => ({ ...w }));
}

export async function createWorkout(data) {
  if (ready()) {
    const doc = await Workout.create(data);
    return toApi(doc);
  }
  const copy = { ...data };
  mem.workouts.unshift(copy);
  return { ...copy };
}