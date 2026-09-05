const VAULT = [
  { title: "Protocollo operatore", when: "2026-01-01", body: "Nome visibile, codice pack, pin firmati." },
  { title: "Guida preload", when: "2026-11-12", body: "Ordine download e installazione. Si apre il 12 novembre." },
  { title: "Guida prima notte", when: "2026-11-19", body: "Cosa fare ora 0-8 senza perdere tempo." },
  { title: "Guida completamento day-1", when: "2026-11-19", body: "Percorso missioni e giri utili del primo giorno." },
  { title: "Guida mezzi e soldi onesti", when: "2026-11-19", body: "Cosa prendere la prima notte, senza trainer." },
  { title: "Guida easter e mappe", when: "2026-11-19", body: "Cosa segnare e come spostarsi." }
];
const BRIEFS = [
  "Oggi: identita e codice. Un pin solo se verificabile.",
  "Oggi: le guide si aprono il 12 e il 19. Non prima.",
  "Oggi: invita qualcuno in sala, non sotto un Reel.",
  "Oggi: email alert vera.",
  "Oggi: checklist. Il vault si apre da solo."
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
