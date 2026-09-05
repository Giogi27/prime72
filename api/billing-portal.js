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
  const email = String(body.email || "").trim().toLowerCase();
  if (!email.includes("@")) return res.status(400).json({ error: "Serve l'email usata su Stripe" });

  const origin = (req.headers.origin || "https://prime72.vercel.app").replace(/\/$/, "");
  const list = new URLSearchParams();
  list.append("email", email);
  list.append("limit", "1");

  const cr = await fetch("https://api.stripe.com/v1/customers?" + list.toString(), {
    headers: { Authorization: "Bearer " + key }
  });
  const customers = await cr.json();
  const customer = customers.data && customers.data[0];
  if (!customer) return res.status(404).json({ error: "Nessun abbonamento su questa email" });

  const params = new URLSearchParams();
  params.append("customer", customer.id);
  params.append("return_url", origin + "/#dash");

  const pr = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + key,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params
  });
  const data = await pr.json();
  if (!data.url) {
    return res.status(500).json({
      error: (data.error && data.error.message) || "Attiva il Customer portal in Stripe"
    });
  }
  return res.status(200).json({ url: data.url });
};
