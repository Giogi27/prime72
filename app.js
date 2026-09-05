const LAUNCH = new Date("2026-11-19T00:00:00-05:00");
const STORE_PINS = "p72_pins";
const STORE_FEED = "p72_feed";
const STORE_ALERT = "p72_alert";
const SB_URL = "https://soskkfqeudtqfarzjlal.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvc2trZnFldWR0cWZhcnpqbGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1ODg5NzIsImV4cCI6MjEwNDE2NDk3Mn0.zxvsRI0_PHU5-xCvpgJlWySnBbCemxbPuI6Zpx7HQLw";
const sb = window.supabase.createClient(SB_URL, SB_KEY);function tickCountdown() {
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

function show(name) {
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  const view = document.getElementById("view-" + name);
  if (view) view.classList.add("active");
  document.querySelectorAll(".nav button").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === name);
  });
  if (name === "map") setTimeout(initMap, 60);
}
document.querySelectorAll(".nav button").forEach((b) => {
  b.addEventListener("click", () => show(b.dataset.view));
});

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
  { lat: 25.7617, lng: -80.1918, title: "Vice City downtown", type: "Quartiere", note: "Skyline Extended Look + Trailer 2" },
  { lat: 25.7907, lng: -80.13, title: "South Beach analog", type: "Spiaggia", note: "Palme e cabrio" },
  { lat: 25.778, lng: -80.187, title: "Porto container", type: "Quartiere", note: "Inquadratura aerea tramonto" },
  { lat: 25.806, lng: -80.122, title: "Locale neon", type: "Locale", note: "Insegne rosa/ciano" },
  { lat: 25.73, lng: -80.24, title: "Residenziale interno", type: "Quartiere", note: "Case basse, traffico diurno" }
];

let map, pendingLatLng, userPins = loadJSON(STORE_PINS, []);

function initMap() {
  if (map) {
    map.invalidateSize();
    return;
  }
  map = L.map("map").setView([25.77, -80.18], 12);
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; OSM &copy; CARTO",
    maxZoom: 19
  }).addTo(map);
    seedPins.concat(userPins).forEach(placePin);
  sb.from("pins").select("*").then(function (res) {
    if (res.error) {
      toast("Pin cloud: " + res.error.message);
      return;
    }
    (res.data || []).forEach(placePin);
  });
  map.on("click", (e) => {
    pendingLatLng = e.latlng;
    toast("Punto selezionato. Compila e pubblica.");
  });
}

function placePin(p) {
  if (!map) return;
  L.marker([p.lat, p.lng])
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
  placePin(pin);
  const { error } = await sb.from("pins").insert(pin);
  if (error) toast("Pin locale ok, cloud: " + error.message);
  else toast("Pin visibile a tutti.");
  document.getElementById("pinTitle").value = "";
  document.getElementById("pinNote").value = "";
  pendingLatLng = null;
}

const seedFeed = [
  { t: "seed", votes: 184, text: "Preload PS5 Store visibile in alcune regioni EU — da confermare IT." },
  { t: "seed", votes: 251, text: "Nel Extended Look la targa Bentine / Leonida è ricorrente." },
  { t: "seed", votes: 410, text: "Mappa: il porto container è a sud-est del core Vice City." },
  { t: "seed", votes: 33, text: "Rockstar conferma ancora il 19 novembre. Nessun slip ufficiale." }
];

async function renderFeed() {
  const box = document.getElementById("feed");
  if (!box) return;
  let rows = [];
  try {
    const res = await sb.from("discoveries").select("*").order("created_at", { ascending: false }).limit(50);
    if (res.error) throw res.error;
    rows = res.data || [];
  } catch (e) {
    rows = loadJSON(STORE_FEED, []);
  }
  const fromCloud = rows.map(function (r) {
    return { votes: r.votes || 1, text: r.body || r.text, t: "cloud" };
  });
  const all = fromCloud.concat(seedFeed);
  box.innerHTML = all.map(function (r) {
    return '<article class="item"><div class="meta"><span class="votes">▲ ' +
      (r.votes || 1) + "</span> " +
      (r.t === "cloud" ? "community" : r.t === "seed" ? "esempio" : "tu") +
      "</div><p>" + r.text + "</p></article>";
  }).join("");
}

async function addDiscovery() {
  const input = document.getElementById("discText");
  const text = (input && input.value ? input.value : "").trim();
  if (!text) return toast("Scrivi la scoperta.");
  const { error } = await sb.from("discoveries").insert({ body: text });
  if (error) {
    toast("Errore: " + error.message);
    return;
  }
  input.value = "";
  toast("Pubblicata per tutti.");
  renderFeed();
}

const ticker = document.getElementById("ticker");
if (ticker) {
  ticker.innerHTML = "<span>LAUNCH · 19 NOV 2026 &nbsp;|&nbsp; PRELOAD · 12 NOV &nbsp;|&nbsp; PIN IN LOCALE</span>";
}
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
