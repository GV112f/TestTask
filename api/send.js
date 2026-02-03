function json(res, status, data) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  // quick healthcheck
  if (req.method === "GET") {
    return json(res, 200, { ok: true, message: "send endpoint is alive" });
  }

  if (req.method !== "POST") {
    return json(res, 405, { ok: false, error: "Method not allowed" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const mailFrom = process.env.MAIL_FROM;

  if (!apiKey) return json(res, 500, { ok: false, error: "Missing RESEND_API_KEY in env" });
  if (!mailFrom) return json(res, 500, { ok: false, error: "Missing MAIL_FROM in env" });

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

    // hard timeout for Resend call (10s)
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 10_000);

    let resp, bodyText;
    try {
      resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: mailFrom,
          to: ["golban.vlad15@gmail.com"], 
          subject,
          text,
        }),
        signal: controller.signal,
      });

      bodyText = await resp.text();
    } finally {
      clearTimeout(t);
    }

    if (!resp.ok) {
      return json(res, 502, { ok: false, error: bodyText, status: resp.status });
    }

    return json(res, 200, { ok: true, provider: bodyText });
  } catch (e) {
    // if fetch aborted
    const msg = String(e && e.name === "AbortError" ? "Resend request timed out (10s)" : e);
    return json(res, 504, { ok: false, error: msg });
  }
}


