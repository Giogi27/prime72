async function sendInbox() {
  if (typeof hasSession === "function" && !hasSession()) {
    return toast("Solo chi ha l'abbonamento può scrivere.");
  }
  const body = ((document.getElementById("inboxText") || {}).value || "").trim();
  const email = ((document.getElementById("dashEmail") || {}).value || "").trim();
  if (body.length < 4) return toast("Scrivi il messaggio.");
  if (!sb) return toast("Database non collegato.");
  const op = typeof getOp === "function" ? getOp() : {};
  const pack = typeof loadJSON === "function" ? loadJSON(STORE_PACK, null) : null;
  const author = (op && op.name) || (pack && pack.name) || "operatore";
  const { error } = await sb.from("inbox").insert({
    author: author,
    email: email,
    body: body.slice(0, 1000)
  });
  if (error) return toast("Crea la tabella inbox in Supabase (inbox.sql).");
  document.getElementById("inboxText").value = "";
  toast("Messaggio inviato.");
}

async function loadInbox() {
  const box = document.getElementById("adminInbox");
  if (!box || !sb) return;
  const secret = ((document.getElementById("adminSecret") || {}).value || "").trim();
  if (!secret) {
    box.innerHTML = "<p>Inserisci la password admin.</p>";
    return;
  }
  const { data, error } = await sb.from("inbox").select("*").order("created_at", { ascending: false }).limit(80);
  if (error) {
    box.innerHTML = "<p>Tabella inbox mancante. Incolla inbox.sql in Supabase.</p>";
    return;
  }
  if (!data || !data.length) {
    box.innerHTML = "<p>Nessun messaggio.</p>";
    return;
  }
  box.innerHTML = data.map(function (m) {
    const when = m.created_at ? new Date(m.created_at).toLocaleString() : "";
    return '<article class="card" style="margin-bottom:10px"><p><strong>' +
      (m.author || "?") + "</strong> · " + (m.email || "no email") +
      "</p><p>" + (m.body || "") + "</p><p class='hint'>" + when + "</p></article>";
  }).join("");
}

(function hookInbox() {
  const prev = window.loadPending;
  window.loadPending = function () {
    if (typeof prev === "function") prev();
    loadInbox();
  };
})();
