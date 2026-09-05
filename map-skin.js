const ZONE = L.latLngBounds([25.64, -80.38], [25.89, -80.11]);

function restyleMap(target) {
  if (!target) return;
  target.eachLayer(function (layer) {
    if (layer instanceof L.TileLayer) target.removeLayer(layer);
  });
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    subdomains: "abcd",
    attribution: "Carto",
    maxZoom: 18
  }).addTo(target);
  target.setMinZoom(11);
  target.setMaxZoom(16);
  target.setMaxBounds(ZONE.pad(0.04));
  target.fitBounds(ZONE);
}

(function hookSkin() {
  const prev = window.initMap;
  window.initMap = function () {
    if (typeof prev === "function") prev();
    if (map) {
      restyleMap(map);
      setTimeout(function () { map.invalidateSize(); }, 80);
    }
  };
})();
