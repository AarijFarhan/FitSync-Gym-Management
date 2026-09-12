import bcrypt from "bcryptjs";

export const demoPasswordHash = bcrypt.hashSync("demo1234", 8);

export const demoPassword = "demo1234";

export const gyms = [
  { id: "gym_northstar", name: "Karachi Strength & Fitness", slug: "karachi-strength-fitness", plan: "PRO", members: 128, trainers: 6, status: "active", mrr: 149, joined: "Jan 12, 2025" },
  { id: "gym_harbor", name: "Lahore FitHub", slug: "lahore-fithub", plan: "FREE", members: 9, trainers: 2, status: "active", mrr: 0, joined: "Aug 04, 2025" },
  { id: "gym_peak", name: "Islamabad Performance Club", slug: "islamabad-performance-club", plan: "PRO", members: 74, trainers: 4, status: "active", mrr: 149, joined: "Mar 19, 2025" },
];

export const demoUsers = [
  { id: "usr_admin", name: "Ayesha Khan", email: "admin@fitsync.demo", role: "super_admin", gymName: "FitSync Pakistan HQ", gymPlan: "PRO", avatar: "AK", passwordHash: demoPasswordHash },
  { id: "usr_owner", name: "Hamza Ahmed", email: "owner@fitsync.demo", role: "gym_owner", gymId: "gym_northstar", gymName: "Karachi Strength & Fitness", gymPlan: "PRO", avatar: "HA", passwordHash: demoPasswordHash },
  { id: "usr_trainer", name: "Usman Ali", email: "trainer@fitsync.demo", role: "trainer", gymId: "gym_northstar", gymName: "Karachi Strength & Fitness", gymPlan: "PRO", avatar: "UA", passwordHash: demoPasswordHash },
  { id: "usr_member", name: "Hira Malik", email: "member@fitsync.demo", role: "member", gymId: "gym_northstar", gymName: "Karachi Strength & Fitness", gymPlan: "PRO", avatar: "HM", passwordHash: demoPasswordHash },
  { id: "usr_free", name: "Bilal Sheikh", email: "free@fitsync.demo", role: "gym_owner", gymId: "gym_harbor", gymName: "Lahore FitHub", gymPlan: "FREE", avatar: "BS", passwordHash: demoPasswordHash },
];

export const members = [
  { id: "mem_001", gymId: "gym_northstar", name: "Hira Malik", email: "hira.malik@karachistrength.demo", goal: "Build strength", status: "Active", trainer: "Usman Ali", progress: 78, lastActive: "Today, 9:42 AM", joined: "Feb 14, 2025", initials: "HM" },
  { id: "mem_002", gymId: "gym_northstar", name: "Areeba Khan", email: "areeba.khan@karachistrength.demo", goal: "Improve mobility", status: "Active", trainer: "Usman Ali", progress: 64, lastActive: "Yesterday", joined: "Mar 02, 2025", initials: "AK" },
  { id: "mem_003", gymId: "gym_northstar", name: "Talha Ahmed", email: "talha.ahmed@karachistrength.demo", goal: "Lose 10 kg", status: "At risk", trainer: "Fahad Iqbal", progress: 41, lastActive: "5 days ago", joined: "Apr 18, 2025", initials: "TA" },
  { id: "mem_004", gymId: "gym_northstar", name: "Maham Raza", email: "maham.raza@karachistrength.demo", goal: "Train for a 10K", status: "Active", trainer: "Sana Noor", progress: 86, lastActive: "Today, 7:18 AM", joined: "May 27, 2025", initials: "MR" },
  { id: "mem_005", gymId: "gym_harbor", name: "Saad Hussain", email: "saad.hussain@lahorefithub.demo", goal: "General fitness", status: "Active", trainer: "Bilal Sheikh", progress: 52, lastActive: "Today", joined: "Jun 01, 2025", initials: "SH" },
];

export const trainers = [
  { id: "trn_001", gymId: "gym_northstar", name: "Usman Ali", email: "usman.ali@karachistrength.demo", specialty: "Strength & conditioning", members: 28, status: "Active", initials: "UA" },
  { id: "trn_002", gymId: "gym_northstar", name: "Fahad Iqbal", email: "fahad.iqbal@karachistrength.demo", specialty: "Performance training", members: 24, status: "Active", initials: "FI" },
  { id: "trn_003", gymId: "gym_northstar", name: "Sana Noor", email: "sana.noor@karachistrength.demo", specialty: "Running & endurance", members: 18, status: "Away", initials: "SN" },
  { id: "trn_004", gymId: "gym_harbor", name: "Bilal Sheikh", email: "bilal.sheikh@lahorefithub.demo", specialty: "General fitness", members: 9, status: "Active", initials: "BS" },
];

export const attendance = [
  { id: "att_001", gymId: "gym_northstar", member: "Hira Malik", date: "Today", checkIn: "09:42 AM", checkOut: null, status: "Present" },
  { id: "att_002", gymId: "gym_northstar", member: "Maham Raza", date: "Today", checkIn: "07:18 AM", checkOut: "08:23 AM", status: "Present" },
  { id: "att_003", gymId: "gym_northstar", member: "Areeba Khan", date: "Yesterday", checkIn: "05:46 PM", checkOut: "06:52 PM", status: "Present" },
  { id: "att_004", gymId: "gym_northstar", member: "Talha Ahmed", date: "Yesterday", checkIn: "—", checkOut: null, status: "Absent" },
];

export const workouts = [
  { id: "wrk_001", gymId: "gym_northstar", name: "Lower body strength", type: "Strength", scheduledFor: "Today · 5:30 PM", duration: 55, status: "Scheduled", member: "Hira Malik" },
  { id: "wrk_002", gymId: "gym_northstar", name: "Mobility & core", type: "Mobility", scheduledFor: "Tomorrow · 7:00 AM", duration: 40, status: "Scheduled", member: "Areeba Khan" },
  { id: "wrk_003", gymId: "gym_northstar", name: "Tempo run", type: "Cardio", scheduledFor: "Mon · 6:30 AM", duration: 45, status: "Completed", member: "Maham Raza" },
];

export const dietPlans = [
  {
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
  },
];