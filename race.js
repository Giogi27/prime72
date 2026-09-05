async function renderRace() {
  const box = document.getElementById("raceBoard");
  const you = document.getElementById("raceYou");
  const cta = document.getElementById("raceCta");
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
    box.innerHTML = "<p class='hint'>La griglia è vuota. I primi pin validi aprono la corsa.</p>";
  } else {
    box.innerHTML = rows.map(function (r, i) {
      return '<article class="race-row' + (i < 3 ? " top" : "") + '">' +
        "<b>#" + (i + 1) + "</b><strong>" + r.name + "</strong><span>" + r.pins + " pin</span></article>";
    }).join("");
  }
  const op = typeof getOp === "function" ? getOp() : {};
  const mine = (op.name || "").trim();
  const idx = rows.findIndex(function (r) { return r.name === mine; });
  const inPack = typeof hasPack === "function" && hasPack();
  if (you) {
    if (!inPack) you.textContent = "Classifica pubblica. Per scalare serve il Launch Pack.";
    else if (!mine) you.textContent = "Pack attivo. Salva il nome in Profilo per entrare in griglia.";
    else if (idx < 0) you.textContent = mine + " è in gara. In attesa del primo pin validato.";
    else you.textContent = mine + " · posizione #" + (idx + 1) + " · " + rows[idx].pins + " pin validati";
  }
  if (cta) cta.hidden = !!inPack;
}
(function hookRace() {
  const prev = window.show;
  window.show = function (name, skip) {
    prev(name, skip);
    if (name === "feed") renderRace();
  };
})();
