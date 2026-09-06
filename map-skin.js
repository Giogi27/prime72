window.lockZone = function () {};

const ANALOG = [
  { lat: 25.7907, lng: -80.1300, title: "Lungomare", type: "Spiaggia" },
  { lat: 25.7780, lng: -80.1870, title: "Porto", type: "Quartiere" },
  { lat: 25.7617, lng: -80.1918, title: "Centro", type: "Quartiere" },
  { lat: 25.8060, lng: -80.1220, title: "Insegne", type: "Locale" },
  { lat: 25.7950, lng: -80.2760, title: "Aeroporto", type: "Quartiere" }
];

function ensureGps() {
  const stage = document.querySelector(".map-stage");
  if (!stage || document.getElementById("gpsHud")) return;
  const el = document.createElement("div");
  el.id = "gpsHud";
  el.className = "gps-hud";
  el.textContent = "GPS  --.----   ---.----";
  stage.appendChild(el);
}

function ensureNight() {
  const bar = document.querySelector(".radar-bar");
  if (!bar || document.getElementById("nightBtn")) return;
  const b = document.createElement("button");
  b.id = "nightBtn";
  b.type = "button";
  b.textContent = "Notte";
  b.onclick = function () {
    document.getElementById("map").classList.toggle("night");
    b.classList.toggle("active");
  };
  bar.appendChild(b);
}

function restyleMap(target) {
  if (!target) return;
  if (!target._skinned) {
    target._skinned = true;
    target.eachLayer(function (layer) {
      if (layer instanceof L.TileLayer) target.removeLayer(layer);
    });
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Esri",
      maxZoom: 18
    }).addTo(target);
    target.setMinZoom(10);
    target.setMaxZoom(18);
    target.setMaxBounds(null);
  }
  ensureGps();
  ensureNight();
  if (typeof addCityLabels === "function") addCityLabels(target);
  if (!target._gps) {
    target._gps = true;
    target.on("mousemove", function (e) {
      const el = document.getElementById("gpsHud");
      if (!el) return;
      el.textContent = "GPS  " + e.latlng.lat.toFixed(4) + "   " + e.latlng.lng.toFixed(4);
    });
  }
}

window.addTiles = function (target) {
  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Esri",
    maxZoom: 18
  }).addTo(target);
};

(function hookSkin() {
  const prev = window.initMap;
  window.initMap = function () {
    if (typeof prev === "function") prev();
    if (window.map) {
      restyleMap(map);
      setTimeout(function () { map.invalidateSize(); }, 120);
    }
  };
  if (window.map) restyleMap(map);
})();
