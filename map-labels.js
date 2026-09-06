const CITY_LABELS = [
  { lat: 25.7907, lng: -80.1340, name: "RIVA", kind: "zone", z: 11 },
  { lat: 25.7617, lng: -80.1918, name: "CENTRO", kind: "zone", z: 11 },
  { lat: 25.8065, lng: -80.1250, name: "NEON", kind: "zone", z: 11 },
  { lat: 25.7780, lng: -80.1870, name: "DARSENA", kind: "zone", z: 11 },
  { lat: 25.7950, lng: -80.2760, name: "PISTA", kind: "zone", z: 11 },
  { lat: 25.7320, lng: -80.2440, name: "GIARDINI", kind: "zone", z: 12 },
  { lat: 25.8500, lng: -80.1750, name: "DUNE", kind: "zone", z: 12 },
  { lat: 25.7310, lng: -80.1620, name: "ISOLE", kind: "zone", z: 12 },
  { lat: 25.8680, lng: -80.1220, name: "NORD", kind: "zone", z: 12 },

  { lat: 25.7880, lng: -80.1320, name: "CORAL AVE", kind: "road", z: 14, rot: 88 },
  { lat: 25.7805, lng: -80.1305, name: "RIVA DRIVE", kind: "road", z: 14, rot: 88 },
  { lat: 25.7750, lng: -80.1890, name: "BAIA BLVD", kind: "road", z: 14, rot: 8 },
  { lat: 25.7900, lng: -80.2080, name: "AUTOSTRADA 7", kind: "road", z: 13, rot: 6 },
  { lat: 25.7845, lng: -80.1550, name: "PONTE EST", kind: "road", z: 13, rot: -12 },
  { lat: 25.7680, lng: -80.1895, name: "VIA DELLE TORRI", kind: "road", z: 14, rot: 90 },
  { lat: 25.8010, lng: -80.1410, name: "STRADA PALME", kind: "road", z: 14, rot: 70 },
  { lat: 25.8100, lng: -80.1228, name: "LITORANEA", kind: "road", z: 14, rot: 88 },
  { lat: 25.7570, lng: -80.1980, name: "ANELLO SUD", kind: "road", z: 14, rot: 20 },
  { lat: 25.7935, lng: -80.2500, name: "VIA PISTA", kind: "road", z: 14, rot: -8 },

  { lat: 25.7812, lng: -80.1308, name: "Club Palme", kind: "spot", z: 15 },
  { lat: 25.7756, lng: -80.1390, name: "Molo 12", kind: "spot", z: 15 },
  { lat: 25.7902, lng: -80.1288, name: "Hotel Rosa", kind: "spot", z: 15 },
  { lat: 25.7704, lng: -80.1855, name: "Stazione", kind: "spot", z: 15 },
  { lat: 25.8078, lng: -80.1235, name: "Insegne", kind: "spot", z: 15 },
  { lat: 25.7688, lng: -80.1340, name: "Spiaggia Sud", kind: "spot", z: 15 },
  { lat: 25.7948, lng: -80.2735, name: "Terminal", kind: "spot", z: 15 },
  { lat: 25.7788, lng: -80.1860, name: "Porto", kind: "spot", z: 15 }
];

function labelIcon(item) {
  const rot = item.rot ? "transform:rotate(" + item.rot + "deg)" : "";
  return L.divIcon({
    className: "map-lab wrap-" + item.kind,
    html: '<span class="map-lab " data-kind="' + item.kind + '" style="' + rot + '">' + item.name + "</span>",
    iconSize: [1, 1],
    iconAnchor: [0, 0]
  });
}

function addCityLabels(target) {
  if (!target || target._labels) return;
  target._labels = [];
  CITY_LABELS.forEach(function (item) {
    const mk = L.marker([item.lat, item.lng], {
      icon: labelIcon(item),
      interactive: false,
      keyboard: false,
      zIndexOffset: -200
    });
    mk._needZ = item.z;
    target._labels.push(mk);
  });
  function sync() {
    const z = target.getZoom();
    target._labels.forEach(function (mk) {
      const on = z >= mk._needZ;
      if (on && !target.hasLayer(mk)) mk.addTo(target);
      if (!on && target.hasLayer(mk)) target.removeLayer(mk);
    });
  }
  target.on("zoomend", sync);
  sync();
}

window.addCityLabels = addCityLabels;
