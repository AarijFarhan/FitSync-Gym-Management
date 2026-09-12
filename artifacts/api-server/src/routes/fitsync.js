import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Stripe from "stripe";
import { randomUUID } from "node:crypto";
import { sendDietPlanNotification } from "../services/notifications.js";

const router = Router();
const now = () => new Date().toISOString();
const initials = (name) => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
const id = (prefix) => `${prefix}_${randomUUID().slice(0, 8)}`;

const gyms = [
  { id: "gym_northstar", name: "Karachi Strength & Fitness", slug: "karachi-strength-fitness", plan: "PRO", members: 128, trainers: 6, status: "active", mrr: 149, joined: "Jan 12, 2025" },
  { id: "gym_harbor", name: "Lahore FitHub", slug: "lahore-fithub", plan: "FREE", members: 9, trainers: 2, status: "active", mrr: 0, joined: "Aug 04, 2025" },
  { id: "gym_peak", name: "Islamabad Performance Club", slug: "islamabad-performance-club", plan: "PRO", members: 74, trainers: 4, status: "active", mrr: 149, joined: "Mar 19, 2025" },
];

const demoUsers = [
  { id: "usr_admin", name: "Ayesha Khan", email: "admin@fitsync.demo", role: "super_admin", gymName: "FitSync Pakistan HQ", gymPlan: "PRO", avatar: "AK", passwordHash: bcrypt.hashSync("demo1234", 8) },
  { id: "usr_owner", name: "Hamza Ahmed", email: "owner@fitsync.demo", role: "gym_owner", gymId: "gym_northstar", gymName: "Karachi Strength & Fitness", gymPlan: "PRO", avatar: "HA", passwordHash: bcrypt.hashSync("demo1234", 8) },
  { id: "usr_trainer", name: "Usman Ali", email: "trainer@fitsync.demo", role: "trainer", gymId: "gym_northstar", gymName: "Karachi Strength & Fitness", gymPlan: "PRO", avatar: "UA", passwordHash: bcrypt.hashSync("demo1234", 8) },
  { id: "usr_member", name: "Hira Malik", email: "member@fitsync.demo", role: "member", gymId: "gym_northstar", gymName: "Karachi Strength & Fitness", gymPlan: "PRO", avatar: "HM", passwordHash: bcrypt.hashSync("demo1234", 8) },
  { id: "usr_free", name: "Bilal Sheikh", email: "free@fitsync.demo", role: "gym_owner", gymId: "gym_harbor", gymName: "Lahore FitHub", gymPlan: "FREE", avatar: "BS", passwordHash: bcrypt.hashSync("demo1234", 8) },
];

const members = [
  { id: "mem_001", gymId: "gym_northstar", name: "Hira Malik", email: "hira.malik@karachistrength.demo", goal: "Build strength", status: "Active", trainer: "Usman Ali", progress: 78, lastActive: "Today, 9:42 AM", joined: "Feb 14, 2025", initials: "HM" },
  { id: "mem_002", gymId: "gym_northstar", name: "Areeba Khan", email: "areeba.khan@karachistrength.demo", goal: "Improve mobility", status: "Active", trainer: "Usman Ali", progress: 64, lastActive: "Yesterday", joined: "Mar 02, 2025", initials: "AK" },
  { id: "mem_003", gymId: "gym_northstar", name: "Talha Ahmed", email: "talha.ahmed@karachistrength.demo", goal: "Lose 10 kg", status: "At risk", trainer: "Fahad Iqbal", progress: 41, lastActive: "5 days ago", joined: "Apr 18, 2025", initials: "TA" },
  { id: "mem_004", gymId: "gym_northstar", name: "Maham Raza", email: "maham.raza@karachistrength.demo", goal: "Train for a 10K", status: "Active", trainer: "Sana Noor", progress: 86, lastActive: "Today, 7:18 AM", joined: "May 27, 2025", initials: "MR" },
  { id: "mem_005", gymId: "gym_harbor", name: "Saad Hussain", email: "saad.hussain@lahorefithub.demo", goal: "General fitness", status: "Active", trainer: "Bilal Sheikh", progress: 52, lastActive: "Today", joined: "Jun 01, 2025", initials: "SH" },
];

const trainers = [
  { id: "trn_001", gymId: "gym_northstar", name: "Usman Ali", email: "usman.ali@karachistrength.demo", specialty: "Strength & conditioning", members: 28, status: "Active", initials: "UA" },
  { id: "trn_002", gymId: "gym_northstar", name: "Fahad Iqbal", email: "fahad.iqbal@karachistrength.demo", specialty: "Performance training", members: 24, status: "Active", initials: "FI" },
  { id: "trn_003", gymId: "gym_northstar", name: "Sana Noor", email: "sana.noor@karachistrength.demo", specialty: "Running & endurance", members: 18, status: "Away", initials: "SN" },
  { id: "trn_004", gymId: "gym_harbor", name: "Bilal Sheikh", email: "bilal.sheikh@lahorefithub.demo", specialty: "General fitness", members: 9, status: "Active", initials: "BS" },
];

const attendance = [
  { id: "att_001", gymId: "gym_northstar", member: "Hira Malik", date: "Today", checkIn: "09:42 AM", checkOut: null, status: "Present" },
  { id: "att_002", gymId: "gym_northstar", member: "Maham Raza", date: "Today", checkIn: "07:18 AM", checkOut: "08:23 AM", status: "Present" },
  { id: "att_003", gymId: "gym_northstar", member: "Areeba Khan", date: "Yesterday", checkIn: "05:46 PM", checkOut: "06:52 PM", status: "Present" },
  { id: "att_004", gymId: "gym_northstar", member: "Talha Ahmed", date: "Yesterday", checkIn: "—", checkOut: null, status: "Absent" },
];

const workouts = [
  { id: "wrk_001", gymId: "gym_northstar", name: "Lower body strength", type: "Strength", scheduledFor: "Today · 5:30 PM", duration: 55, status: "Scheduled", member: "Hira Malik" },
  { id: "wrk_002", gymId: "gym_northstar", name: "Mobility & core", type: "Mobility", scheduledFor: "Tomorrow · 7:00 AM", duration: 40, status: "Scheduled", member: "Areeba Khan" },
  { id: "wrk_003", gymId: "gym_northstar", name: "Tempo run", type: "Cardio", scheduledFor: "Mon · 6:30 AM", duration: 45, status: "Completed", member: "Maham Raza" },
];

const dietPlans = [{
  id: "diet_001",
  gymId: "gym_northstar",
  memberId: "mem_001",
  title: "Strength Builder · High-protein plan",
  calories: 2280,
  generatedAt: "Today, 10:04 AM",
  days: [
    { day: "Monday", meals: [{ type: "Breakfast", name: "Greek yogurt, berries & oats", calories: 480 }, { type: "Lunch", name: "Grilled chicken quinoa bowl", calories: 620 }, { type: "Dinner", name: "Baked salmon, rice & greens", calories: 700 }, { type: "Snacks", name: "Cottage cheese & banana", calories: 280 }] },
    { day: "Tuesday", meals: [{ type: "Breakfast", name: "Scrambled eggs, avocado toast & fruit", calories: 520 }, { type: "Lunch", name: "Turkey hummus wrap", calories: 560 }, { type: "Dinner", name: "Lean beef stir-fry with vegetables", calories: 680 }, { type: "Snacks", name: "Protein smoothie", calories: 300 }] },
    { day: "Wednesday", meals: [{ type: "Breakfast", name: "Overnight oats with almond butter", calories: 500 }, { type: "Lunch", name: "Tuna and white bean salad", calories: 580 }, { type: "Dinner", name: "Chicken fajita bowl", calories: 690 }, { type: "Snacks", name: "Apple with peanut butter", calories: 260 }] },
  ],
}];

function secret() {
  return process.env.JWT_SECRET ?? process.env.SESSION_SECRET ?? "fitsync_demo_dev_secret_key_2026";
}

function tokenFor(user) {
  return jwt.sign({ sub: user.id, role: user.role, gymId: user.gymId }, secret(), { expiresIn: "7d" });
}

function currentUser(req) {
  const raw = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!raw) return undefined;
  try {
    const payload = jwt.verify(raw, secret());
    return demoUsers.find((user) => user.id === payload.sub);
  } catch {
    return undefined;
  }
}

function requireUser(req, res) {
  const user = currentUser(req);
  if (!user) {
    res.status(401).json({ error: "Sign in required" });
    return undefined;
  }
  if (user.gymId && gyms.find((gym) => gym.id === user.gymId)?.status === "suspended") {
    res.status(403).json({ error: "This gym account is suspended" });
    return undefined;
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

router.get("/auth/demo", (_req, res) => {
  res.json([
    { role: "super_admin", email: "admin@fitsync.demo", password: "demo1234", name: "Ayesha Khan" },
    { role: "gym_owner", email: "owner@fitsync.demo", password: "demo1234", name: "Hamza Ahmed" },
    { role: "trainer", email: "trainer@fitsync.demo", password: "demo1234", name: "Usman Ali" },
    { role: "member", email: "member@fitsync.demo", password: "demo1234", name: "Hira Malik" },
  ]);
});

router.post("/auth/login", async (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.toLowerCase().trim() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const user = demoUsers.find((candidate) => candidate.email === email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  res.json({ token: tokenFor(user), user: { ...user, passwordHash: undefined } });
});

router.get("/dashboard/overview", (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  const gym = gyms.find((candidate) => candidate.id === user.gymId);
  const memberCount = members.filter((member) => member.gymId === user.gymId).length;
  const trainerCount = trainers.filter((trainer) => trainer.gymId === user.gymId).length;
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

router.get("/members", (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  const search = typeof req.query.search === "string" ? req.query.search.toLowerCase() : "";
  const data = members.filter((member) => (user.role === "super_admin" || member.gymId === user.gymId) && (!search || `${member.name} ${member.email}`.toLowerCase().includes(search)));
  res.json(data.map(({ gymId: _gymId, ...member }) => member));
});

router.post("/members", (req, res) => {
  const user = requireUser(req, res);
  if (!user || !["gym_owner", "super_admin"].includes(user.role)) {
    if (user) res.status(403).json({ error: "Gym owner access required" });
    return;
  }
  const gym = gyms.find((candidate) => candidate.id === user.gymId);
  const count = members.filter((member) => member.gymId === user.gymId).length;
  if (gym?.plan === "FREE" && count >= 10) {
    res.status(402).json({ error: "Free plan limit reached. Upgrade to Pro for unlimited members." });
    return;
  }
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
  const goal = typeof req.body?.goal === "string" ? req.body.goal.trim() : "";
  if (!name || !email || !goal) {
    res.status(400).json({ error: "Name, email, and goal are required" });
    return;
  }
  const member = { id: id("mem"), gymId: user.gymId ?? "", name, email, goal, status: "Active", trainer: "Unassigned", progress: 0, lastActive: "Not yet", joined: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }), initials: initials(name) };
  members.push(member);
  res.status(201).json(member);
});

router.get("/members/:memberId", (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  const member = members.find((candidate) => candidate.id === req.params.memberId && (user.role === "super_admin" || candidate.gymId === user.gymId));
  if (!member) { res.status(404).json({ error: "Member not found" }); return; }
  const { gymId: _gymId, ...safeMember } = member;
  res.json(safeMember);
});

router.get("/trainers", (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  res.json(trainers.filter((trainer) => user.role === "super_admin" || trainer.gymId === user.gymId).map(({ gymId: _gymId, ...trainer }) => trainer));
});

router.post("/trainers", (req, res) => {
  const user = requireUser(req, res);
  if (!user || !["gym_owner", "super_admin"].includes(user.role)) {
    if (user) res.status(403).json({ error: "Gym owner access required" });
    return;
  }
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
  const specialty = typeof req.body?.specialty === "string" ? req.body.specialty.trim() : "";
  if (!name || !email || !specialty) { res.status(400).json({ error: "Name, email, and specialty are required" }); return; }
  const trainer = { id: id("trn"), gymId: user.gymId ?? "", name, email, specialty, members: 0, status: "Active", initials: initials(name) };
  trainers.push(trainer);
  res.status(201).json(trainer);
});

router.get("/attendance", (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  res.json(attendance.filter((record) => user.role === "super_admin" || record.gymId === user.gymId).map(({ gymId: _gymId, ...record }) => record));
});

router.post("/attendance", (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  const target = members.find((member) => member.id === req.body?.memberId && (user.role === "super_admin" || member.gymId === user.gymId));
  if (!target) { res.status(404).json({ error: "Member not found" }); return; }
  const record = { id: id("att"), gymId: target.gymId, member: target.name, date: "Today", checkIn: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }), checkOut: null, status: "Present" };
  attendance.unshift(record);
  res.status(201).json(record);
});

router.get("/diet-plans", (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  const data = dietPlans.filter((plan) => user.role === "super_admin" || plan.gymId === user.gymId).map(({ gymId: _gymId, ...plan }) => plan);
  res.json(data);
});

router.post("/diet-plans", async (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  if (!canUsePro(user)) { res.status(402).json({ error: "AI diet plans are available on the Pro plan." }); return; }
  const member = members.find((candidate) => candidate.gymId === user.gymId);
  if (!member) { res.status(404).json({ error: "No member found for this gym" }); return; }
  const goal = typeof req.body?.goal === "string" ? req.body.goal : "maintenance";
  const calories = goal === "weight loss" ? 1850 : goal === "muscle gain" ? 2650 : 2280;
  const aiDays = await generateWithOpenAI(req.body).catch(() => undefined);
  const baseDays = dietPlans[0].days;
  const sevenDays = [
    ...baseDays,
    ...Array.from({ length: 4 }, (_, index) => ({
      ...baseDays[index % baseDays.length],
      day: ["Thursday", "Friday", "Saturday", "Sunday"][index],
    })),
  ];
  const plan = {
    ...dietPlans[0],
    id: id("diet"),
    memberId: user.role === "member" ? "mem_001" : member.id,
    calories,
    title: `${goal[0].toUpperCase()}${goal.slice(1)} · AI nutrition plan`,
    generatedAt: "Just now",
    days: aiDays ?? sevenDays,
  };
  dietPlans.unshift(plan);
  void sendDietPlanNotification(user).catch(() => undefined);
  res.status(201).json(plan);
});

router.get("/workouts", (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  res.json(workouts.filter((workout) => user.role === "super_admin" || workout.gymId === user.gymId).map(({ gymId: _gymId, ...workout }) => workout));
});

router.post("/workouts", (req, res) => {
  const user = requireUser(req, res);
  if (!user || !["trainer", "gym_owner", "super_admin"].includes(user.role)) {
    if (user) res.status(403).json({ error: "Trainer access required" });
    return;
  }
  const workout = { id: id("wrk"), gymId: user.gymId ?? "", name: req.body?.name ?? "New workout", type: req.body?.type ?? "Strength", scheduledFor: "Today", duration: Number(req.body?.duration ?? 45), status: "Completed", member: "Assigned member" };
  workouts.unshift(workout);
  res.status(201).json(workout);
});

router.post("/billing/checkout", async (req, res) => {
  const user = requireUser(req, res);
  if (!user || user.role !== "gym_owner") { if (user) res.status(403).json({ error: "Gym owner access required" }); return; }
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    const gym = gyms.find((candidate) => candidate.id === user.gymId);
    if (gym) { gym.plan = "PRO"; gym.mrr = 149; user.gymPlan = "PRO"; }
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

router.post("/billing/webhook", (req, res) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) { res.json({ received: true, mode: "demo" }); return; }
  const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : undefined;
  if (!stripe) { res.status(500).json({ error: "Stripe secret is not configured" }); return; }
  try {
    const event = stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET);
    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.created") {
      const subscription = event.data.object;
      const gym = gyms.find((candidate) => candidate.id === subscription.metadata.gymId);
      if (gym) { gym.plan = "PRO"; gym.mrr = 149; }
    }
    res.json({ received: true });
  } catch { res.status(400).json({ error: "Invalid Stripe signature" }); }
});

router.get("/admin/gyms", (req, res) => {
  const user = requireUser(req, res);
  if (!user || user.role !== "super_admin") { if (user) res.status(403).json({ error: "Super admin access required" }); return; }
  res.json(gyms);
});

router.post("/admin/gyms/:gymId/suspend", (req, res) => {
  const user = requireUser(req, res);
  if (!user || user.role !== "super_admin") { if (user) res.status(403).json({ error: "Super admin access required" }); return; }
  const gym = gyms.find((candidate) => candidate.id === req.params.gymId);
  if (!gym) { res.status(404).json({ error: "Gym not found" }); return; }
  gym.status = gym.status === "active" ? "suspended" : "active";
  res.json(gym);
});

export default router;
