const LAUNCH = new Date("2026-11-19T00:00:00-05:00"); // midnight ET

function tickCountdown() {
  const now = new Date();
  let diff = LAUNCH - now;
  if (diff < 0) diff = 0;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = String(v).padStart(2, "0"); };
  set("d", d); set("h", h); set("m", m); set("s", s);
}
setInterval(tickCountdown, 1000);
tickCountdown();

function show(name) {
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  document.getElementById("view-" + name).classList.add("active");
  document.querySelectorAll(".nav button").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === name);
  });
  if (name === "map") setTimeout(initMap, 50);
}
document.querySelectorAll(".nav button").forEach((b) => {
  b.addEventListener("click", () => show(b.dataset.view));
});

function toast(msg) {
  const t = document.getElementById("toast");
  t.hidden = false;
  t.textContent = msg;
  clearTimeout(toast._id);
  toast._id = setTimeout(() => (t.hidden = true), 2600);
}

/* MAP — Vice City-ish coords using a stylized OSM view around Miami */
let map, pendingLatLng;
const seedPins = [
  { lat: 25.7617, lng: -80.1918, title: "Vice City downtown", type: "Quartiere", note: "Skyline Extended Look + Trailer 2" },
  { lat: 25.7907, lng: -80.1300, title: "South Beach / Ocean Drive analog", type: "Spiaggia", note: "Palme, traffic convertible rosso" },
  { lat: 25.778, lng: -80.187, title: "Porto e container", type: "Quartiere", note: "Inquadratura aerea tramonto" },
  { lat: 25.806, lng: -80.122, title: "Locale notturno neon", type: "Locale", note: "Insegne rosa/ciano trailer 1" },
  { lat: 25.73, lng: -80.24, title: "Zone residenziali interne", type: "Quartiere", note: "Case basse + traffico diurno" }
];

function initMap() {
  if (map) { map.invalidateSize(); return; }
  map = L.map("map", { zoomControl: true }).setView([25.77, -80.18], 12);
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; OSM &copy; CARTO",
    maxZoom: 19
  }).addTo(map);
  seedPins.forEach((p) => placePin(p));
  map.on("click", (e) => {
    pendingLatLng = e.latlng;
    toast("Punto selezionato. Compila e pubblica.");
  });
}

function placePin(p) {
  const m = L.marker([p.lat, p.lng]).addTo(map);
  m.bindPopup(`<strong>${p.title}</strong><br><em>${p.type}</em><br>${p.note || ""}`);
}

function addPin() {
  const title = document.getElementById("pinTitle").value.trim();
  const type = document.getElementById("pinType").value;
  const note = document.getElementById("pinNote").value.trim();
  if (!pendingLatLng) return toast("Clicca prima un punto sulla mappa.");
  if (!title) return toast("Dai un nome alla location.");
  placePin({ lat: pendingLatLng.lat, lng: pendingLatLng.lng, title, type, note });
  toast("Pin pubblicato (locale). In produzione va su database.");
  document.getElementById("pinTitle").value = "";
  document.getElementById("pinNote").value = "";
  pendingLatLng = null;
}

/* FEED */
const reports = [
  { t: "2m", votes: 184, text: "Preload PS5 Store visibile in alcune regioni EU — da confermare IT." },
  { t: "11m", votes: 92, text: "Nel Extended Look la targa Bentine / Leonida è ricorrente. Catalogo auto in lavorazione." },
  { t: "34m", votes: 251, text: "Possibile catena fast food 'Love Fist / Chill' avvistata sullo skyline." },
  { t: "1h", votes: 67, text: "Teoria: il fallito score del trailer 2 è tutorial stealth, non heist principale." },
  { t: "3h", votes: 410, text: "Mappa: il porto container è a sud-est del core Vice City, non a nord." },
  { t: "5h", votes: 33, text: "Rockstar conferma ancora il 19 novembre. Nessun slip ufficiale." }
];
document.getElementById("ticker").innerHTML =
  "<span>SERVER STATUS · NOMINALE &nbsp;|&nbsp; PRELOAD · 12 NOV &nbsp;|&nbsp; LAUNCH · 19 NOV 00:00 ET &nbsp;|&nbsp; COMMUNITY PINS · 5 SEED &nbsp;|&nbsp; META ECONOMIA · IN ATTESA DAY-1</span>";
document.getElementById("feed").innerHTML = reports.map((r) => `
  <article class="item">
    <div class="meta"><span class="votes">▲ ${r.votes}</span> ${r.t} fa · community</div>
    <p>${r.text}</p>
  </article>
`).join("");

/* QUIZ */
const questions = [
  {
    q: "Prima ora in Leonida: che fai?",
    a: ["Guido senza meta e rubo la prima cabrio", "Cerco un tetto e un piano", "Salto in una sparatoria per testare la fisica", "Apro mappa e segno ogni icona"]
  },
  {
    q: "Chi vuoi mainare?",
    a: ["Lucia — controllo e nervi", "Jason — impulso e muscoli", "Switch continuo, è un duo", "Chi ha lo skill tree più sporco"]
  },
  {
    q: "Soldi day-1: strategia?",
    a: ["Story fino al primo grosso score", "Side hustle e vendita street", "Esplorazione: il bottino è la mappa", "Crew: non si fa nulla da soli"]
  },
  {
    q: "Cosa ti serve da PRIME 72?",
    a: ["Alert quando i server respirano", "Mappa e pin prima degli altri", "Meta prezzi / proprietà", "Tutto: voglio il Launch Pack"]
  }
];
const profiles = [
  { name: "Tourist armato", blurb: "Le prime 72 ore le usi per respirare Vice City. Priorità: mappa, veicoli iconici, foto-pin. Sblocca layer esplorazione." },
  { name: "Planner da motel", blurb: "Vuoi un tetto e un income entro la notte 1. Priorità: proprietà starter + tracker prezzi Pro." },
  { name: "Chaos pilot", blurb: "Testi il motore, poi pensi. Priorità: feed live wanted/fisica e matching crew per heist sporchi." },
  { name: "Operatore", blurb: "Tratti il lancio come una finestra di mercato. Launch Pack: alert + meta + crew IT." }
];
let qi = 0, score = [0, 0, 0, 0];
function renderQuiz() {
  const box = document.getElementById("quizBox");
  if (qi >= questions.length) {
    const winner = score.indexOf(Math.max(...score));
    const p = profiles[winner];
    box.innerHTML = `<div class="result"><h3>${p.name}</h3><p>${p.blurb}</p><br><button class="btn primary" onclick="show('pro')">Vedi Launch Pack</button></div>`;
    return;
  }
  const cur = questions[qi];
  box.innerHTML = `<div class="quiz-q"><h3>${qi + 1}. ${cur.q}</h3><div class="opts">${cur.a.map((opt, i) => `<button onclick="answer(${i})">${opt}</button>`).join("")}</div></div>`;
}
function answer(i) {
  score[i]++;
  qi++;
  renderQuiz();
}
renderQuiz();

function fakeCheckout() {
  toast("Demo: qui si aprirebbe Stripe Checkout. Pack sbloccato in locale.");
  localStorage.setItem("prime72_pro", "1");
}
