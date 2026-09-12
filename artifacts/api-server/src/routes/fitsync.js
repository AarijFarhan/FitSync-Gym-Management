import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Stripe from "stripe";
import { randomUUID } from "node:crypto";
import { sendDietPlanNotification } from "../services/notifications.js";


import {
  countMembers,
  countTrainers,
  createAttendance,
  createDietPlan,
  createMember,
  createTrainer,
  createWorkout,
  findUserById,
  findUserByEmail,
  getGym,
  getMember,
  listAttendance,
  listDietPlans,
  listGyms,
  listMembers,
  listTrainers,
  listWorkouts,
  updateGym,
  updateUserPlan,
} from "../data/repository.js";
import { demoPassword } from "../data/demo-data.js";

const router = Router();
const now = () => new Date().toISOString();
const initials = (name) =>
  name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
const id = (prefix) => `${prefix}_${randomUUID().slice(0, 8)}`;

const SEVEN_DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function secret() {
  return process.env.JWT_SECRET ?? process.env.SESSION_SECRET ?? "fitsync_demo_dev_secret_key_2026";
}

function tokenFor(user) {
  return jwt.sign({ sub: user.id, role: user.role, gymId: user.gymId }, secret(), { expiresIn: "7d" });
}

async function currentUser(req) {
  const raw = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!raw) return undefined;
  try {
    const payload = jwt.verify(raw, secret());
    return await findUserById(payload.sub);
  } catch {
    return undefined;
  }
}

async function requireUser(req, res) {
  const user = await currentUser(req);
  if (!user) {
    res.status(401).json({ error: "Sign in required" });
    return undefined;
  }
  if (user.gymId) {
    const gym = await getGym(user.gymId);
    if (gym?.status === "suspended") {
      res.status(403).json({ error: "This gym account is suspended" });
      return undefined;
    }
  }
  return user;
}

function canUsePro(user) {
  return user.gymPlan === "PRO" || user.role === "super_admin";
}

async function generateWithOpenAI(input) {
  if (!process.env.OPENAI_API_KEY) return undefined;
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [{
        role: "user",
        content: `Create a practical 7-day nutrition plan as JSON with a days array. Each day must contain day and meals. Each meal must contain type, name, and calories. Use this profile: ${JSON.stringify(input)}.`,
      }],
    }),
  });
  if (!response.ok) return undefined;
  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  if (!content) return undefined;
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed.days) ? parsed.days : undefined;
  } catch {
    return undefined;
  }
}

router.get("/auth/demo", async (_req, res) => {
  const demoEmails = [
    "admin@fitsync.demo",
    "owner@fitsync.demo",
    "trainer@fitsync.demo",
    "member@fitsync.demo",
  ];
  const accounts = [];
  for (const email of demoEmails) {
    const user = await findUserByEmail(email);
    if (user) accounts.push({ role: user.role, email: user.email, password: demoPassword, name: user.name });
  }
  res.json(accounts);
});

router.post("/auth/login", async (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.toLowerCase().trim() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const user = await findUserByEmail(email);
  if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  const { passwordHash: _passwordHash, ...safeUser } = user;
  res.json({ token: tokenFor(user), user: safeUser });
});

router.get("/dashboard/overview", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const gym = user.gymId ? await getGym(user.gymId) : undefined;
  const memberCount = user.gymId ? await countMembers(user.gymId) : 0;
  const trainerCount = user.gymId ? await countTrainers(user.gymId) : 0;
  const stats = user.role === "super_admin"
    ? [{ label: "Active gyms", value: "42", delta: "+8.4%", tone: "green" }, { label: "Platform MRR", value: "$18,420", delta: "+12.6%", tone: "green" }, { label: "Members", value: "2,184", delta: "+9.1%", tone: "green" }, { label: "Pro adoption", value: "68%", delta: "+4.2%", tone: "green" }]
    : user.role === "trainer"
      ? [{ label: "Assigned members", value: "28", delta: "+3 this month", tone: "green" }, { label: "Sessions this week", value: "34", delta: "+18.2%", tone: "green" }, { label: "Avg. adherence", value: "86%", delta: "+6.4%", tone: "green" }, { label: "At-risk members", value: "3", delta: "Needs attention", tone: "amber" }]
      : user.role === "member"
        ? [{ label: "Current streak", value: "12 days", delta: "+4 this week", tone: "green" }, { label: "Workouts complete", value: "18", delta: "+5 this month", tone: "green" }, { label: "Plan adherence", value: "92%", delta: "+8.1%", tone: "green" }, { label: "Next session", value: "5:30 PM", delta: "Today", tone: "blue" }]
        : [{ label: "Total members", value: String(memberCount || 128), delta: "+12.8%", tone: "green" }, { label: "Active trainers", value: String(trainerCount || 6), delta: "+1 this month", tone: "green" }, { label: "Revenue this month", value: gym?.plan === "PRO" ? "$12,840" : "$0", delta: "+14.6%", tone: "green" }, { label: "Attendance rate", value: "84.6%", delta: "+5.2%", tone: "green" }];

  res.json({
    role: user.role,
    stats,
    growth: [{ month: "Jan", members: 72 }, { month: "Feb", members: 86 }, { month: "Mar", members: 94 }, { month: "Apr", members: 108 }, { month: "May", members: 116 }, { month: "Jun", members: 128 }],
    activity: [
      { id: "act_1", title: "New member joined", detail: "Maham Raza joined Karachi Strength & Fitness", time: "12 min ago", type: "member" },
      { id: "act_2", title: "Diet plan generated", detail: "AI plan ready for Hira Malik", time: "1 hr ago", type: "sparkles" },
      { id: "act_3", title: "Workout completed", detail: "Areeba completed Mobility & core", time: "2 hrs ago", type: "check" },
      { id: "act_4", title: "Subscription renewed", detail: "Karachi Strength & Fitness renewed Pro", time: "Yesterday", type: "billing" },
    ],
  });
});

router.get("/members", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const search = typeof req.query.search === "string" ? req.query.search.toLowerCase() : "";
  const gymId = user.role === "super_admin" ? undefined : user.gymId;
  const data = await listMembers({ gymId, search });
  res.json(data);
});

router.post("/members", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user || !["gym_owner", "super_admin"].includes(user.role)) {
    if (user) res.status(403).json({ error: "Gym owner access required" });
    return;
  }
  const gym = user.gymId ? await getGym(user.gymId) : undefined;
  if (user.gymId) {
    const count = await countMembers(user.gymId);
    if (gym?.plan === "FREE" && count >= 10) {
      res.status(402).json({ error: "Free plan limit reached. Upgrade to Pro for unlimited members." });
      return;
    }
  }
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
  const goal = typeof req.body?.goal === "string" ? req.body.goal.trim() : "";
  if (!name || !email || !goal) {
    res.status(400).json({ error: "Name, email, and goal are required" });
    return;
  }
  const member = {
    id: id("mem"),
    gymId: user.gymId ?? "",
    name,
    email,
    goal,
    status: "Active",
    trainer: "Unassigned",
    progress: 0,
    lastActive: "Not yet",
    joined: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    initials: initials(name),
  };
  const created = await createMember(member);
  res.status(201).json(created);
});

router.get("/members/:memberId", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const member = await getMember(req.params.memberId, user.role === "super_admin" ? undefined : user.gymId);
  if (!member) { res.status(404).json({ error: "Member not found" }); return; }
  res.json(member);
});

router.get("/trainers", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  res.json(await listTrainers({ gymId: user.role === "super_admin" ? undefined : user.gymId }));
});

router.post("/trainers", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user || !["gym_owner", "super_admin"].includes(user.role)) {
    if (user) res.status(403).json({ error: "Gym owner access required" });
    return;
  }
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
  const specialty = typeof req.body?.specialty === "string" ? req.body.specialty.trim() : "";
  if (!name || !email || !specialty) { res.status(400).json({ error: "Name, email, and specialty are required" }); return; }
  const trainer = { id: id("trn"), gymId: user.gymId ?? "", name, email, specialty, members: 0, status: "Active", initials: initials(name) };
  const created = await createTrainer(trainer);
  res.status(201).json(created);
});

router.get("/attendance", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  res.json(await listAttendance({ gymId: user.role === "super_admin" ? undefined : user.gymId }));
});

router.post("/attendance", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const target = await getMember(req.body?.memberId, user.role === "super_admin" ? undefined : user.gymId);
  if (!target) { res.status(404).json({ error: "Member not found" }); return; }
  const record = {
    id: id("att"),
    gymId: target.gymId,
    member: target.name,
    date: "Today",
    checkIn: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    checkOut: null,
    status: "Present",
  };
  const created = await createAttendance(record);
  res.status(201).json(created);
});

router.get("/diet-plans", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  res.json(await listDietPlans({ gymId: user.role === "super_admin" ? undefined : user.gymId }));
});

router.post("/diet-plans", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  if (!canUsePro(user)) { res.status(402).json({ error: "AI diet plans are available on the Pro plan." }); return; }
  const goal = typeof req.body?.goal === "string" ? req.body.goal : "maintenance";
  const calories = goal === "weight loss" ? 1850 : goal === "muscle gain" ? 2650 : 2280;
  const aiDays = await generateWithOpenAI(req.body).catch(() => undefined);

  const memberId = user.role === "member"
    ? user.id
    : (await listMembers({ gymId: user.gymId }))[0]?.id;
  if (!memberId) { res.status(404).json({ error: "No member found for this gym" }); return; }

  const baseDays = (await listDietPlans({ gymId: user.gymId }))[0]?.days ?? [
    { day: "Monday", meals: [{ type: "Breakfast", name: "Greek yogurt, berries & oats", calories: 480 }, { type: "Lunch", name: "Grilled chicken quinoa bowl", calories: 620 }, { type: "Dinner", name: "Baked salmon, rice & greens", calories: 700 }, { type: "Snacks", name: "Cottage cheese & banana", calories: 280 }] },
  ];
  const sevenDays = [
    ...baseDays,
    ...Array.from({ length: 4 }, (_, index) => ({
      ...baseDays[index % baseDays.length],
      day: SEVEN_DAY_NAMES[index + 3],
    })),
  ];

  const plan = {
    id: id("diet"),
    gymId: user.gymId ?? "",
    memberId,
    calories,
    title: `${goal[0].toUpperCase()}${goal.slice(1)} · AI nutrition plan`,
    generatedAt: "Just now",
    days: aiDays ?? sevenDays,
  };
  const created = await createDietPlan(plan);
  void sendDietPlanNotification(user).catch(() => undefined);
  res.status(201).json(created);
});

router.get("/workouts", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  res.json(await listWorkouts({ gymId: user.role === "super_admin" ? undefined : user.gymId }));
});

router.post("/workouts", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user || !["trainer", "gym_owner", "super_admin"].includes(user.role)) {
    if (user) res.status(403).json({ error: "Trainer access required" });
    return;
  }
  const workout = {
    id: id("wrk"),
    gymId: user.gymId ?? "",
    name: req.body?.name ?? "New workout",
    type: req.body?.type ?? "Strength",
    scheduledFor: "Today",
    duration: Number(req.body?.duration ?? 45),
    status: "Completed",
    member: "Assigned member",
  };
  const created = await createWorkout(workout);
  res.status(201).json(created);
});

router.post("/billing/checkout", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user || user.role !== "gym_owner") { if (user) res.status(403).json({ error: "Gym owner access required" }); return; }
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    if (user.gymId) {
      await updateGym(user.gymId, { plan: "PRO", mrr: 149 });
      await updateUserPlan(user.id, "PRO");
    }
    res.json({ url: "/billing?success=demo", status: "demo_upgraded" });
    return;
  }
  const stripe = new Stripe(stripeKey);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID ?? "price_demo", quantity: 1 }],
    success_url: `${req.protocol}://${req.get("host")}/billing?success=true`,
    cancel_url: `${req.protocol}://${req.get("host")}/billing?canceled=true`,
    client_reference_id: user.gymId,
  });
  res.json({ url: session.url ?? "/billing", status: "created" });
});

router.post("/billing/webhook", async (req, res) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) { res.json({ received: true, mode: "demo" }); return; }
  const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : undefined;
  if (!stripe) { res.status(500).json({ error: "Stripe secret is not configured" }); return; }
  try {
    const event = stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET);
    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.created") {
      const subscription = event.data.object;
      const gym = await getGym(subscription.metadata?.gymId);
      if (gym) await updateGym(gym.id, { plan: "PRO", mrr: 149 });
    }
    res.json({ received: true });
  } catch { res.status(400).json({ error: "Invalid Stripe signature" }); }
});

router.get("/admin/gyms", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user || user.role !== "super_admin") { if (user) res.status(403).json({ error: "Super admin access required" }); return; }
  res.json(await listGyms());
});

router.post("/admin/gyms/:gymId/suspend", async (req, res) => {
  const user = await requireUser(req, res);
  if (!user || user.role !== "super_admin") { if (user) res.status(403).json({ error: "Super admin access required" }); return; }
  const gym = await getGym(req.params.gymId);
  if (!gym) { res.status(404).json({ error: "Gym not found" }); return; }
  const updated = await updateGym(gym.id, { status: gym.status === "active" ? "suspended" : "active" });
  res.json(updated);
});

export default router;