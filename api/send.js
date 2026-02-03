export default async function handler(request) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { name = "", email = "", message = "" } = await request.json();

    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ ok: false, error: "Email required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const subject = "6weeks - Форма заповнена";
    const text =
      `Name: ${String(name).trim() || "-"}\n` +
      `Email: ${String(email).trim()}\n` +
      `Message: ${String(message).trim() || "-"}`;

    // Resend: POST https://api.resend.com/emails with from/to/subject/text|html
    // Docs: Send Email endpoint :contentReference[oaicite:2]{index=2}
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM, // ex: "Acme <onboarding@resend.dev>" (sau domeniu verificat)
        to: ["golban.vlad15@gmail.com"],
        subject,
        text,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return new Response(JSON.stringify({ ok: false, error: errText }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
