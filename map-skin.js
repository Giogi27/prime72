const ZONE = L.latLngBounds([25.72, -80.30], [25.85, -80.12]);

function restyleMap(target) {
  if (!target) return;
  target.eachLayer(function (layer) {
    if (layer instanceof L.TileLayer) target.removeLayer(layer);
  });
  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Esri",
    maxZoom: 18
  }).addTo(target);
  target.setMinZoom(12);
  target.setMaxZoom(16);
  target.setMaxBounds(ZONE.pad(0.05));
  target.fitBounds(ZONE);
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
