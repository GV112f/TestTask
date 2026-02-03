import nodemailer from "nodemailer";

function json(res, status, data) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    return json(res, 200, { ok: true, message: "send endpoint is alive" });
  }

  if (req.method !== "POST") {
    return json(res, 405, { ok: false, error: "Method not allowed" });
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user) return json(res, 500, { ok: false, error: "Missing GMAIL_USER in env" });
  if (!pass) return json(res, 500, { ok: false, error: "Missing GMAIL_APP_PASSWORD in env" });

  try {
    const { name = "", email = "", message = "" } = req.body || {};

    if (!email || typeof email !== "string") {
      return json(res, 400, { ok: false, error: "Email required" });
    }

    const subject = "6weeks - Форма заповнена";
    const text =
      `Name: ${String(name).trim() || "-"}\n` +
      `Email: ${String(email).trim()}\n` +
      `Message: ${String(message).trim() || "-"}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass }
    });

    await transporter.sendMail({
      from: `6weeks form <${user}>`,
      to: "6weeks.13h@gmail.com",
      subject,
      text,
      replyTo: String(email).trim()
    });

    return json(res, 200, { ok: true });
  } catch (e) {
    return json(res, 500, { ok: false, error: String(e) });
  }
}
