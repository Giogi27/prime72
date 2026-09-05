const VAULT = [
  { title: "Protocollo operatore", when: "2026-01-01", body: "Nome visibile, codice pack, pin firmati." },
  { title: "Guida preload", when: "2026-11-12", body: "Ordine download e installazione." },
  { title: "Guida prima notte", when: "2026-11-19", body: "Cosa fare ora 0-8." },
  { title: "Guida day-1", when: "2026-11-19", body: "Percorso del primo giorno." },
  { title: "Cheat di gioco", when: "2026-11-19", body: "Il 19 novembre qui trovi i cheat se sono nel gioco. Quelli di Rockstar, non file esterni." },
  { title: "Guide mappa", when: "2026-11-19", body: "Cosa segnare e come spostarsi." }
];
const BRIEFS = [
  "Oggi: identita e codice.",
  "Oggi: guide e cheat di gioco si aprono il 12 e il 19.",
  "Oggi: invita qualcuno in sala.",
  "Oggi: email alert vera.",
  "Oggi: checklist."
];
function vaultOpen(item) {
  return new Date() >= new Date(item.when + "T00:00:00-05:00");
}
function renderVault() {
  const box = document.getElementById("vaultGrid");
  if (!box) return;
  let openN = 0;
  box.innerHTML = VAULT.map(function (v) {
    const open = vaultOpen(v);
    if (open) openN++;
    const date = v.when.slice(8, 10) + "." + v.when.slice(5, 7);
    return '<article class="crate' + (open ? " open" : "") + '"><span class="seal">' +
      (open ? "APERTA" : "SI APRE " + date) + "</span><h4>" + v.title + "</h4><p class=\"hint\">" +
      (open ? v.body : "Chiusa fino al " + date + ".") + "</p></article>";
  }).join("");
  const kpi = document.getElementById("kpiVault");
  if (kpi) kpi.textContent = openN + "/" + VAULT.length;
}
function renderBrief() {
  const el = document.getElementById("dailyBrief");
  if (!el) return;
  const i = Math.floor(Date.now() / 86400000) % BRIEFS.length;
  el.textContent = "BRIEF OGGI \u00b7 " + BRIEFS[i];
}
(function hookDash() {
  const prev = window.renderDash;
  window.renderDash = function () {
    if (typeof prev === "function") prev();
    renderVault();
    renderBrief();
  };
})();
