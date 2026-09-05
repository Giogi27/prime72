const VAULT = [
  { title: "Protocollo operatore", when: "2026-01-01", body: "Nome visibile, codice pack solo tuo, pin firmati, zero leak." },
  { title: "Dossier preload", when: "2026-11-12", body: "Qui entra store / download / ordine installazione il 12 novembre." },
  { title: "Dossier drop 72h", when: "2026-11-19", body: "Piano ora 0-72: tetto, mezzo, primo income." },
  { title: "Rotte day-1", when: "2026-11-19", body: "3 giri ripetibili dopo il disco." },
  { title: "Priorita veicoli", when: "2026-11-19", body: "Cosa prendere la prima notte." },
  { title: "Easter + crew", when: "2026-11-19", body: "Protocollo uova e regole crew." }
];
const BRIEFS = [
  "Oggi: salva identita e codice. Un pin solo se e verificabile.",
  "Oggi: niente teoria da forum. Segna solo cio che hai visto tu.",
  "Oggi: invita un amico a mettere un pin, non un leak.",
  "Oggi: controlla che l email alert sia vera.",
  "Oggi: ripassa la checklist. Il vault si apre da solo."
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
      (open ? "APERTO" : "SIGILLO " + date) + "</span><h4>" + v.title + "</h4><p class=\"hint\">" +
      (open ? v.body : "Sigillato. Si apre il " + date + ".") + "</p></article>";
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
