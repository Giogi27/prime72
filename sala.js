const STORE_SALA = "p72_sala";

function salaPosts() {
  return loadJSON(STORE_SALA, []);
}
function renderSala() {
  const box = document.getElementById("salaList");
  if (!box) return;
  const rows = salaPosts().slice().reverse();
  if (!rows.length) {
    box.innerHTML = "<p class='hint'>Sala vuota. Il primo post lo scrivi tu.</p>";
    return;
  }
  box.innerHTML = rows.map(function (r) {
    return '<article class="item"><div class="meta"><strong>' +
      (r.name || "operatore") + "</strong> · " +
      new Date(r.at).toLocaleString("it-IT") +
      "</div><p>" + r.body + "</p></article>";
  }).join("");
}
async function addSala() {
  if (typeof hasSession === "function" && !hasSession()) {
    return toast("La sala e solo per il pack.");
  }
  const input = document.getElementById("salaText");
  const text = (input && input.value ? input.value : "").trim();
  if (!text) return toast("Scrivi un messaggio.");
  const pack = loadJSON(STORE_PACK, null);
  const op = typeof getOp === "function" ? getOp() : {};
  const row = {
    name: (op && op.name) || (pack && pack.name) || "operatore",
    body: text.slice(0, 280),
    at: Date.now()
  };
  const rows = salaPosts();
  rows.push(row);
  saveJSON(STORE_SALA, rows.slice(-80));
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
