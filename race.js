async function renderRace() {
  const box = document.getElementById("raceBoard");
  const you = document.getElementById("raceYou");
  if (!box || !sb) return;
  const { data } = await sb.from("pins").select("author,approved").eq("approved", true);
  const counts = {};
  (data || []).forEach(function (p) {
    const name = (p.author || "").trim();
    if (!name) return;
    counts[name] = (counts[name] || 0) + 1;
  });
  const rows = Object.keys(counts).map(function (name) {
    return { name: name, pins: counts[name] };
  }).sort(function (a, b) { return b.pins - a.pins; });
  if (!rows.length) {
    box.innerHTML = "<p class='hint'>Nessun pin approvato in classifica.</p>";
    return;
  }
  box.innerHTML = rows.map(function (r, i) {
    const medal = i === 0 ? "1" : i === 1 ? "2" : i === 2 ? "3" : String(i + 1);
    return '<article class="race-row' + (i < 3 ? " top" : "") + '">' +
      "<b>#" + medal + "</b><strong>" + r.name + "</strong><span>" + r.pins + " pin</span></article>";
  }).join("");
  const op = typeof getOp === "function" ? getOp() : {};
  const mine = (op.name || "").trim();
  const idx = rows.findIndex(function (r) { return r.name === mine; });
  const inPack = typeof hasPack === "function" && hasPack();
  if (you) {
    if (!inPack) you.textContent = "Guardi la gara. Entri solo col Launch Pack.";
    else if (!mine) you.textContent = "Salva un nome in Profilo per firmare i pin.";
    else if (idx < 0) you.textContent = mine + " · 0 pin approvati. Piazza e aspetta l'ok.";
    else you.textContent = mine + " · #" + (idx + 1) + " · " + rows[idx].pins + " pin.";
  }
}
(function hookRace() {
  const prev = window.show;
  window.show = function (name, skip) {
    prev(name, skip);
    if (name === "feed") renderRace();
  };
})();
