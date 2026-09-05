module.exports = async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return res.status(500).json({ error: "Missing STRIPE_SECRET_KEY" });

  let body = {};
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  } catch (e) {
    body = {};
  }
  const secret = String(body.secret || "").trim();
  const expected = process.env.ADMIN_SECRET || "";
  if (expected && secret !== expected) {
    return res.status(401).json({ error: "Password admin non valida" });
  }
  if (!secret) return res.status(401).json({ error: "Password richiesta" });

  const r = await fetch("https://api.stripe.com/v1/subscriptions?status=all&limit=40&expand[]=data.customer", {
    headers: { Authorization: "Bearer " + key }
  });
  const data = await r.json();
  if (data.error) return res.status(500).json({ error: data.error.message });

  const rows = (data.data || []).map(function (s) {
    const c = s.customer && typeof s.customer === "object" ? s.customer : {};
    return {
      id: s.id,
      status: s.status,
      email: c.email || "",
      name: c.name || "",
      period_end: s.current_period_end || 0
    };
  });
  return res.status(200).json({ rows: rows, count: rows.length });
};
