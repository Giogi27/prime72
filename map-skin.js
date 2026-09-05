const ZONE = L.latLngBounds(
  [25.68, -80.32],
  [25.95, -80.10]
);

window.lockZone = function (target) {
  if (!target) return;
  target.setMinZoom(11);
  target.setMaxZoom(16);
  target.setMaxBounds(ZONE.pad(0.08));
};

function restyleMap(target) {
  if (!target || target._skinned) return;
  target._skinned = true;
  target.eachLayer(function (layer) {
    if (layer instanceof L.TileLayer) target.removeLayer(layer);
  });
  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Esri",
    maxZoom: 18
  }).addTo(target);
  lockZone(target);
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
      lockZone(map);
      setTimeout(function () { map.invalidateSize(); }, 120);
    }
  };
  if (window.map) restyleMap(map);
})();
