window.lockZone = function () {};

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
  target.setMaxZoom(18);
  target.setMaxBounds(null);
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
      map.setMaxBounds(null);
      restyleMap(map);
      setTimeout(function () { map.invalidateSize(); }, 120);
    }
  };
  if (window.map) {
    map.setMaxBounds(null);
    restyleMap(map);
  }
})();
