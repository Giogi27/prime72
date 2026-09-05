const ZONE = L.latLngBounds([25.62, -80.42], [26.02, -80.08]);

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
  target.setMinZoom(10);
  target.setMaxZoom(17);
  target.setMaxBounds(ZONE.pad(0.15));
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
