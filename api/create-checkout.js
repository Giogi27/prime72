module.exports = async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return res.status(500).json({ error: "Missing STRIPE_SECRET_KEY" });

  const origin = (req.headers.origin || "https://prime72.vercel.app").replace(/\/$/, "");
  const params = new URLSearchParams();
  params.append("mode", "subscription");
  params.append("success_url", origin + "/#pro?paid=1");
  params.append("cancel_url", origin + "/#pro?cancel=1");
  params.append("line_items[0][quantity]", "1");
  params.append("line_items[0][price_data][currency]", "eur");
  params.append("line_items[0][price_data][unit_amount]", "499");
  params.append("line_items[0][price_data][recurring][interval]", "month");
  params.append("line_items[0][price_data][product_data][name]", "PRIME 72");
  params.append("line_items[0][price_data][product_data][description]", "Console, map pins, vault, race — monthly");

  const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + key,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params
  });
  const data = await r.json();
  if (!data.url) {
    return res.status(500).json({ error: (data.error && data.error.message) || "Stripe error" });
  }
  return res.status(200).json({ url: data.url });
};
