import nodemailer from "nodemailer";

function transporter() {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) return undefined;
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT ?? 587),
    secure: Number(process.env.EMAIL_PORT ?? 587) === 465,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
  });
}

export async function sendDietPlanNotification(user) {
  const mailer = transporter();
  if (!mailer) return;
  await mailer.sendMail({
    from: process.env.EMAIL_FROM ?? process.env.EMAIL_USER,
    to: user.email,
    subject: "Your FitSync diet plan is ready",
    text: `Hi ${user.name}, your personalized FitSync diet plan is ready to review.`,
  });
}

export async function sendSubscriptionExpiryReminder(user, daysRemaining) {
  const mailer = transporter();
  if (!mailer) return;
  await mailer.sendMail({
    from: process.env.EMAIL_FROM ?? process.env.EMAIL_USER,
    to: user.email,
    subject: "Your FitSync Pro plan renews soon",
    text: `Hi ${user.name}, your FitSync Pro plan renews in ${daysRemaining} days.`,
  });
}
