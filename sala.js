function renderSala() {
  const box = document.getElementById("salaList");
  if (!box) return;
  box.innerHTML = "<p class='hint'>Carico la sala...</p>";
  if (!sb) {
    box.innerHTML = "<p class='hint'>Database non collegato.</p>";
    return;
  }
  sb.from("sala").select("*").order("created_at", { ascending: false }).limit(50)
    .then(function (res) {
      if (res.error) {
        box.innerHTML = "<p class='hint'>Crea la tabella sala in Supabase (file sala.sql).</p>";
        return;
      }
      const rows = res.data || [];
      if (!rows.length) {
        box.innerHTML = "<p class='hint'>Sala vuota. Il primo post lo scrivi tu.</p>";
        return;
      }
      box.innerHTML = rows.map(function (r) {
        const when = r.created_at ? new Date(r.created_at).toLocaleString("it-IT") : "";
        return '<article class="item"><div class="meta"><strong>' +
          (r.author || "operatore") + "</strong> · " + when +
          "</div><p>" + (r.body || "") + "</p></article>";
      }).join("");
    });
}

async function addSala() {
  if (typeof hasSession === "function" && !hasSession()) {
    return toast("La sala e solo per il pack.");
  }
  const input = document.getElementById("salaText");
  const text = (input && input.value ? input.value : "").trim();
  if (!text) return toast("Scrivi un messaggio.");
  if (!sb) return toast("Database non collegato.");
  const pack = loadJSON(STORE_PACK, null);
  const op = typeof getOp === "function" ? getOp() : {};
  const author = (op && op.name) || (pack && pack.name) || "operatore";
  const { error } = await sb.from("sala").insert({ author: author, body: text.slice(0, 280) });
  if (error) return toast("Errore sala: " + error.message);
  if (input) input.value = "";
  toast("In sala.");
  renderSala();
}

(function hookSala() {
  const prev = window.renderDash;
  window.renderDash = function () {
    if (typeof prev === "function") prev();
    renderSala();
  };
})();
