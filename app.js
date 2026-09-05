const LAUNCH = new Date("2026-11-19T00:00:00-05:00");
const STORE_PINS = "p72_pins";
const STORE_FEED = "p72_feed";
const STORE_ALERT = "p72_alert";
const SB_URL = "https://soskkfqeudtqfarzjlal.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvc2trZnFldWR0cWZhcnpqbGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1ODg5NzIsImV4cCI6MjEwNDE2NDk3Mn0.zxvsRI0_PHU5-xCvpgJlWySnBbCemxbPuI6Zpx7HQLw";
const sb = window.supabase ? window.supabase.createClient(SB_URL, SB_KEY) : null;

function tickCountdown() {
  const now = new Date();
  let diff = Math.max(0, LAUNCH - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(v).padStart(2, "0");
  };
  set("d", d); set("h", h); set("m", m); set("s", s);
}
setInterval(tickCountdown, 1000);
tickCountdown();

function currentView() {
  const h = (location.hash || "#home").replace("#", "").trim();
  const ok = ["home", "map", "feed", "quiz", "pro", "admin"];
  return ok.indexOf(h) >= 0 ? h : "home";
}

function show(name, skipHash) {
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  const view = document.getElementById("view-" + name);
  if (view) view.classList.add("active");
  document.querySelectorAll(".nav button").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === name);
  });
  if (!skipHash) {
    const next = "#" + name;
    if (location.hash !== next) location.hash = name;
  }
  if (name === "map") setTimeout(initMap, 60);
  if (name === "admin") setTimeout(ensureAdminMap, 80);
}

document.querySelectorAll(".nav button").forEach((b) => {
  b.addEventListener("click", () => show(b.dataset.view));
});
window.addEventListener("hashchange", function () {
  show(currentView(), true);
});
show(currentView(), true);

function toast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.hidden = false;
  t.textContent = msg;
  clearTimeout(toast._id);
  toast._id = setTimeout(() => (t.hidden = true), 2800);
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function saveJSON(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

const seedPins = [
  { lat: 25.7617, lng: -80.1918, title: "Vice City downtown", type: "Quartiere", note: "Skyline" },
  { lat: 25.7907, lng: -80.13, title: "South Beach analog", type: "Spiaggia", note: "Palme" },
  { lat: 25.778, lng: -80.187, title: "Porto container", type: "Quartiere", note: "Trailer" },
  { lat: 25.806, lng: -80.122, title: "Locale neon", type: "Locale", note: "Insegne" },
  { lat: 25.73, lng: -80.24, title: "Residenziale interno", type: "Quartiere", note: "Case" }
];

let map, adminMap, pendingLatLng;

function addTiles(target) {
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OSM",
    maxZoom: 19
  }).addTo(target);
}

function initMap() {
  if (map) {
    map.invalidateSize();
    return;
  }
  map = L.map("map").setView([25.77, -80.18], 12);
  addTiles(map);
  seedPins.forEach(placePin);
  if (sb) {
    sb.from("pins").select("*").then(function (res) {
      (res.data || []).forEach(placePin);
    });
  }
  map.on("click", function (e) {
    pendingLatLng = e.latlng;
    toast("Punto selezionato. Compila e pubblica.");
  });
}

function pinIcon(type) {
  const mapType = {
    Locale: "🍸",
    Spiaggia: "🌴",
    Quartiere: "🏙️",
    Missione: "⭐",
    "Easter egg": "🥚"
  };
  const emoji = mapType[type] || "📍";
  return L.divIcon({
    className: "p72-pin",
    html: '<div class="p72-pin-inner">' + emoji + "</div>",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -28]
  });
}

function placePin(p) {
  if (!map) return;
  L.marker([p.lat, p.lng], { icon: pinIcon(p.type) })
    .addTo(map)
    .bindPopup("<strong>" + p.title + "</strong><br><em>" + p.type + "</em><br>" + (p.note || ""));
}

async function addPin() {
  const title = document.getElementById("pinTitle").value.trim();
  const type = document.getElementById("pinType").value;
  const note = document.getElementById("pinNote").value.trim();
  if (!pendingLatLng) return toast("Clicca prima un punto sulla mappa.");
  if (!title) return toast("Dai un nome alla location.");
  const pin = { lat: pendingLatLng.lat, lng: pendingLatLng.lng, title: title, type: type, note: note };
  if (!sb) return toast("Database non collegato.");
  const { error } = await sb.from("pins").insert(pin);
  if (error) toast("Errore: " + error.message);
  else toast("Inviato. Online solo dopo il tuo ok in Admin.");
  document.getElementById("pinTitle").value = "";
  document.getElementById("pinNote").value = "";
  pendingLatLng = null;
}

async function renderFeed() {
  const box = document.getElementById("feed");
  if (!box) return;
  let rows = [];
  try {
    const res = await sb.from("discoveries").select("*").order("created_at", { ascending: false }).limit(50);
    if (res.error) throw res.error;
    rows = res.data || [];
  } catch (e) {
    rows = [];
  }
  if (!rows.length) {
    box.innerHTML = "<p class='hint'>Nessuna scoperta ancora. Pubblica la prima.</p>";
    return;
  }
  box.innerHTML = rows.map(function (r) {
    return '<article class="item"><div class="meta"><span class="votes">▲ ' +
      (r.votes || 1) + "</span> community</div><p>" +
      (r.body || r.text) + "</p></article>";
  }).join("");
}

async function addDiscovery() {
  const input = document.getElementById("discText");
  const text = (input && input.value ? input.value : "").trim();
  if (!text) return toast("Scrivi la scoperta.");
  const { error } = await sb.from("discoveries").insert({ body: text });
  if (error) return toast("Errore: " + error.message);
  input.value = "";
  toast("Pubblicata per tutti.");
  renderFeed();
}

const ticker = document.getElementById("ticker");
if (ticker) ticker.innerHTML = "<span>LAUNCH · 19 NOV 2026 &nbsp;|&nbsp; PRELOAD · 12 NOV</span>";
renderFeed();

const questions = [
  { q: "Prima ora in Leonida: che fai?", a: ["Guido e rubo la prima cabrio", "Cerco un tetto e un piano", "Salto in una sparatoria", "Apro mappa e segno ogni icona"] },
  { q: "Chi vuoi mainare?", a: ["Lucia", "Jason", "Switch continuo", "Chi ha lo skill tree più sporco"] },
  { q: "Soldi day-1?", a: ["Story fino al primo score", "Side hustle street", "Esplorazione", "Crew"] },
  { q: "Cosa ti serve da PRIME 72?", a: ["Alert server", "Mappa e pin", "Meta prezzi", "Tutto: Launch Pack"] }
];
const profiles = [
  { name: "Tourist armato", blurb: "Priorità: mappa e pin." },
  { name: "Planner da motel", blurb: "Priorità: tetto e tracker prezzi." },
  { name: "Chaos pilot", blurb: "Priorità: feed live e crew." },
  { name: "Operatore", blurb: "Launch Pack." }
];
let qi = 0, score = [0, 0, 0, 0];

function renderQuiz() {
  const box = document.getElementById("quizBox");
  if (!box) return;
  if (qi >= questions.length) {
    const winner = score.indexOf(Math.max.apply(null, score));
    const p = profiles[winner];
    box.innerHTML = '<div class="result"><h3>' + p.name + "</h3><p>" + p.blurb +
      '</p><br><button class="btn primary" onclick="show(\'pro\')">Vedi Launch Pack</button></div>';
    return;
  }
  const cur = questions[qi];
  box.innerHTML = '<div class="quiz-q"><h3>' + (qi + 1) + ". " + cur.q +
    '</h3><div class="opts">' +
    cur.a.map(function (opt, i) {
      return '<button onclick="answer(' + i + ')">' + opt + "</button>";
    }).join("") + "</div></div>";
}
function answer(i) {
  score[i]++;
  qi++;
  renderQuiz();
}
renderQuiz();

function saveAlert() {
  const email = (document.getElementById("alertEmail") || {}).value || "";
  if (!email.includes("@")) return toast("Inserisci una email valida.");
  saveJSON(STORE_ALERT, { email: email, at: Date.now() });
  toast("Alert salvato in locale.");
}
function fakeCheckout() {
  toast("Pro in waitlist. Stripe al giorno 4.");
  localStorage.setItem("prime72_pro", "waitlist");
}

function ensureAdminMap() {
  const el = document.getElementById("adminMap");
  if (!el) return null;
  if (adminMap) {
    setTimeout(function () { adminMap.invalidateSize(); }, 80);
    return adminMap;
  }
  adminMap = L.map("adminMap").setView([25.77, -80.18], 12);
  addTiles(adminMap);
  return adminMap;
}

async function loadPending() {
  const secret = document.getElementById("adminSecret").value.trim();
  const box = document.getElementById("adminList");
  const { data, error } = await sb.rpc("list_pending", { secret: secret });
  if (error) {
    box.innerHTML = "<p>Accesso negato o errore: " + error.message + "</p>";
    return;
  }
  const m = ensureAdminMap();
  if (m) {
    m.eachLayer(function (layer) {
      if (layer instanceof L.Marker) m.removeLayer(layer);
    });
  }
  if (!data || !data.length) {
    box.innerHTML = "<p>Nessun pin in attesa.</p>";
    return;
  }
  const bounds = [];
  data.forEach(function (p) {
    if (m) {
      L.marker([p.lat, p.lng], { icon: pinIcon(p.type) })
        .addTo(m)
        .bindPopup("<strong>" + p.title + "</strong><br>" + p.type);
      bounds.push([p.lat, p.lng]);
    }
  });
  if (m && bounds.length) m.fitBounds(bounds, { padding: [28, 28] });

  box.innerHTML = data.map(function (p) {
    const lat = Number(p.lat).toFixed(5);
    const lng = Number(p.lng).toFixed(5);
    return '<article class="card" style="margin-bottom:10px">' +
      "<h3>" + p.title + "</h3>" +
      "<p>" + (p.type || "") + " · " + (p.note || "nessuna nota") + "</p>" +
      "<p>Coord: " + lat + ", " + lng + "</p>" +
      '<button class="btn ghost" type="button" onclick="focusPending(' + p.lat + "," + p.lng + ')">Centra mappa</button> ' +
      '<button class="btn primary" type="button" onclick="modPin(\'' + p.id + "', true)\">Approva</button> " +
      '<button class="btn ghost" type="button" onclick="modPin(\'' + p.id + "', false)\">Elimina</button>" +
      "</article>";
  }).join("");
}

function focusPending(lat, lng) {
  const m = ensureAdminMap();
  if (m) m.setView([lat, lng], 16);
}

async function modPin(id, ok) {
  const secret = document.getElementById("adminSecret").value.trim();
  const { error } = await sb.rpc("set_pin_approved", { pid: id, secret: secret, ok: ok });
  if (error) return toast(error.message);
  toast(ok ? "Approvato" : "Eliminato");
  loadPending();
}
