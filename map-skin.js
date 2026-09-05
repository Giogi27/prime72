const ZONE = L.latLngBounds([25.64, -80.38], [25.89, -80.11]);

function restyleMap(target) {
  if (!target) return;
  target.eachLayer(function (layer) {
    if (layer instanceof L.TileLayer) target.removeLayer(layer);
  });
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "OSM",
    maxZoom: 19
  }).addTo(target);
  target.setMinZoom(12);
  target.setMaxZoom(16);
  target.setMaxBounds(ZONE.pad(0.06));
  target.fitBounds(ZONE);
}

window.addTiles = function (target) {
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "OSM",
    maxZoom: 19
  }).addTo(target);
};

(function hookSkin() {
  const prev = window.initMap;
  window.initMap = function () {
    if (typeof prev === "function") prev();
    if (map) {
      restyleMap(map);
      setTimeout(function () { map.invalidateSize(); }, 80);
    }
  };
  if (window.map) restyleMap(map);
})();
