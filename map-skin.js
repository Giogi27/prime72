window.lockZone = function () {};

function ensureGps() {
  const stage = document.querySelector(".map-stage");
  if (!stage || document.getElementById("gpsHud")) return;
  const el = document.createElement("div");
  el.id = "gpsHud";
  el.className = "gps-hud";
  el.textContent = "GPS  --.----   ---.----";
  stage.appendChild(el);
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
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Reference_Overlay/MapServer/tile/{z}/{y}/{x}", {
      opacity: 0.65,
      maxZoom: 18
    }).addTo(target);
    target.setMinZoom(10);
    target.setMaxZoom(18);
    target.setMaxBounds(null);
  }
  ensureGps();
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
