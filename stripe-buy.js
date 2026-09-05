async function payWithStripe() {
  const name = ((document.getElementById("loginName") || {}).value || "").trim();
  const code = ((document.getElementById("loginCode") || {}).value || "").trim();
  if (!name) return toast("Prima il nome operatore.");
  if (code.length < 4) return toast("Prima un codice pack di almeno 4 caratteri.");
  localStorage.setItem("p72_pending_name", name);
  localStorage.setItem("p72_pending_code", code);
  toast("Apro Stripe...");
  try {
    const res = await fetch("/api/create-checkout", { method: "POST" });
    const data = await res.json();
    if (!res.ok || !data.url) throw new Error(data.error || "Checkout non creato");
    location.href = data.url;
  } catch (e) {
    toast(e.message || "Stripe non configurato.");
  }
}

async function cancelSubscription() {
  const email = ((document.getElementById("dashEmail") || {}).value || "").trim();
  if (!email.includes("@")) {
    return toast("Scrivi nel campo email quella usata su Stripe, poi Disdici.");
  }
  toast("Apro Stripe...");
  try {
    const res = await fetch("/api/billing-portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email })
    });
    const data = await res.json();
    if (!res.ok || !data.url) throw new Error(data.error || "Portale non disponibile");
    location.href = data.url;
  } catch (e) {
    toast(e.message || "Attiva il Customer portal in Stripe.");
  }
}

(function afterStripeReturn() {
  const q = new URLSearchParams((location.hash.split("?")[1] || location.search.replace("?", "")));
  if (q.get("paid") !== "1") return;
  const name = localStorage.getItem("p72_pending_name") || "";
  const code = localStorage.getItem("p72_pending_code") || "";
  const n = document.getElementById("loginName");
  const c = document.getElementById("loginCode");
  if (n && name) n.value = name;
  if (c && code) c.value = code;
  if (typeof activatePack === "function" && name && code) {
    activatePack();
    toast("Pagamento ok. Pack attivo.");
  }
  history.replaceState(null, "", location.pathname + "#dash");
})();
