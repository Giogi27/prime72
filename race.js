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
    box.innerHTML = "<p class='hint'>" + (typeof t === "function" ? t("raceEmpty") : "") + "</p>";
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
  if (you && typeof t === "function") {
    if (!inPack) you.textContent = t("raceWatch");
    else if (!mine) you.textContent = t("raceNeedName");
    else if (idx < 0) you.textContent = mine + t("raceWait");
    else you.textContent = mine + t("racePos") + (idx + 1) + " · " + rows[idx].pins + " pin";
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
