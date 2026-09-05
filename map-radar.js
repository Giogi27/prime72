let liveMarkers = [];
let mapFilter = "Tutti";
let ghostMark = null;

function renderRadarList() {
  const box = document.getElementById("radarList");
  const count = document.getElementById("radarCount");
  if (!box) return;
  const rows = liveMarkers
    .map(function (mk) { return mk._p72; })
    .filter(function (p) { return p && (mapFilter === "Tutti" || p.type === mapFilter); });
  if (count) count.textContent = rows.length + " segnali";
  if (!rows.length) {
    box.innerHTML = "<p class='hint'>Nessun segnale su questo filtro.</p>";
    return;
  }
  box.innerHTML = rows.map(function (p, i) {
    return '<button class="radar-item" type="button" onclick="focusRadar(' + p.lat + ',' + p.lng + ')">' +
      "<b>" + p.title + "</b><span>" + (p.type || "") +
      (p.author ? " · " + p.author : "") + "</span></button>";
  }).join("");
}

function focusRadar(lat, lng) {
  if (map) map.setView([lat, lng], 15);
}

function setMapFilter(type) {
  mapFilter = type;
  liveMarkers.forEach(function (mk) {
    const show = mapFilter === "Tutti" || (mk._p72 && mk._p72.type === mapFilter);
    if (show) {
      if (!map.hasLayer(mk)) mk.addTo(map);
    } else if (map.hasLayer(mk)) map.removeLayer(mk);
  });
  document.querySelectorAll(".radar-bar button").forEach(function (b) {
    b.classList.toggle("active", b.getAttribute("data-filter") === type);
  });
  renderRadarList();
}

function hookMapClick() {
  if (!map || map._radarHooked) return;
  map._radarHooked = true;
  map.on("click", function (e) {
    pendingLatLng = e.latlng;
    if (ghostMark) map.removeLayer(ghostMark);
    ghostMark = L.circleMarker(e.latlng, {
      radius: 10, color: "#ff2d95", fillColor: "#3df0ff", fillOpacity: 0.7, weight: 2
    }).addTo(map);
    const hint = document.getElementById("mapHint");
    if (hint) hint.textContent = "Punto preso. Dai un nome e invia.";
    toast("Punto sul radar.");
  });
}

(function bootRadar() {
  const prevInit = window.initMap;
  window.initMap = function () {
    if (typeof prevInit === "function") prevInit();
    hookMapClick();
    setTimeout(renderRadarList, 400);
  };
  const prevPlace = window.placePin;
  window.placePin = function (p) {
    if (!map) return;
    const who = p.author ? "<br>da <em>" + p.author + "</em>" : "";
    const mk = L.marker([p.lat, p.lng], { icon: pinIcon(p.type) })
      .addTo(map)
      .bindPopup("<strong>" + p.title + "</strong><br><em>" + (p.type || "") + "</em><br>" + (p.note || "") + who);
    mk._p72 = p;
    liveMarkers.push(mk);
    if (mapFilter !== "Tutti" && p.type !== mapFilter) map.removeLayer(mk);
    renderRadarList();
  };
})();
