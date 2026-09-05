const LAUNCH = new Date("2026-11-19T00:00:00-05:00");
const STORE_ALERT = "p72_alert";
const STORE_OP = "p72_op";
const STORE_PACK = "p72_pack";
const STORE_SESSION = "p72_session";
const STORE_CHECK = "p72_check";
const SB_URL = "https://soskkfqeudtqfarzjlal.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvc2trZnFldWR0cWZhcnpqbGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1ODg5NzIsImV4cCI6MjEwNDE2NDk3Mn0.zxvsRI0_PHU5-xCvpgJlWySnBbCemxbPuI6Zpx7HQLw";
const sb = window.supabase ? window.supabase.createClient(SB_URL, SB_KEY) : null;
const ZONE = [[25.64, -80.38], [25.89, -80.11]];

const CHECKS = [
  "Profilo salvato (nome + crew)",
  "Codice pack annotato da qualche parte",
  "Email alert salvata",
  "Almeno 1 pin inviato e firmato",
  "Preload segnato in calendario (12 nov)",
  "Niente update di sistema la sera del 18",
  "Piano notte 1: tetto + mezzo, niente chase",
  "Giorno 1: un income ripetibile + 3 pin veri"
];

function tickCountdown() {
  const now = new Date();
  const diff = Math.max(0, LAUNCH - now);
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

function hasSession() {
  return localStorage.getItem(STORE_SESSION) === "1";
}
function hasPack() {
  return !!loadJSON(STORE_PACK, null);
}
function currentView() {
  const h = (location.hash || "#home").replace("#", "").trim();
  const ok = ["home", "map", "feed", "quiz", "pro", "dash", "admin"];
  return ok.indexOf(h) >= 0 ? h : "home";
}
function show(name, skipHash) {
  if (name === "dash" && !hasSession()) {
    toast("Entra da Pro con nome e codice pack.");
    name = "pro";
  }
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  const view = document.getElementById("view-" + name);
  if (view) view.classList.add("active");
  document.querySelectorAll(".nav button").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === name);
  });
  if (!skipHash && location.hash !== "#" + name) location.hash = name;
  if (name === "map") setTimeout(initMap, 60);
  if (name === "admin") setTimeout(ensureAdminMap, 80);
  if (name === "dash") renderDash();
  if (name === "pro") prefillLogin();
}
function goConsoleOrPro() {
  if (hasSession()) show("dash");
  else show("pro");
}
document.querySelectorAll(".nav button").forEach((b) => {
  b.addEventListener("click", () => show(b.dataset.view));
});
window.addEventListener("hashchange", function () {
  show(currentView(), true);
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
function getOp() {
  const op = loadJSON(STORE_OP, { name: "", crew: "", photo: "" });
  if (!op.name) op.name = localStorage.getItem("p72_name") || "";
  if (!op.crew) op.crew = localStorage.getItem("p72_crew") || "";
  return op;
}
function refreshNav() {
  const dash = document.getElementById("navDash");
  if (dash) dash.hidden = !hasSession();
}
refreshNav();

const seedPins = [
  { lat: 25.7617, lng: -80.1918, title: "Vice City downtown", type: "Quartiere", note: "Skyline" },
  { lat: 25.7907, lng: -80.13, title: "South Beach analog", type: "Spiaggia", note: "Palme" },
  { lat: 25.778, lng: -80.187, title: "Porto container", type: "Quartiere", note: "Trailer" },
  { lat: 25.806, lng: -80.122, title: "Locale neon", type: "Locale", note: "Insegne" },
  { lat: 25.73, lng: -80.24, title: "Residenziale interno", type: "Quartiere", note: "Case" }
];

let map, adminMap, pendingLatLng;

function addTiles(target) {
  L.tileLayer("https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png", {
    attribution: "Carto",
    maxZoom: 18
  }).addTo(target);
}

function lockZone(target) {
  if (!target) return;
  const b = L.latLngBounds(ZONE);
  target.setMinZoom(11);
  target.setMaxZoom(16);
  target.setMaxBounds(b.pad(0.03));
  target.fitBounds(b);
}

function initMap() {
  if (map) {
    map.invalidateSize();
    lockZone(map);
    return;
  }
  map = L.map("map", { zoomControl: true, attributionControl: false }).setView([25.77, -80.18], 13);
  addTiles(map);
  lockZone(map);
  seedPins.forEach(placePin);
  if (sb) {
    sb.from("pins").select("*").eq("approved", true).then(function (res) {
      (res.data || []).forEach(placePin);
    });
  }
  map.on("click", function (e) {
    pendingLatLng = e.latlng;
    toast("Punto selezionato.");
  });
}

function pinIcon(type) {
  const mapType = {
    Locale: "\uD83C\uDF78",
    Spiaggia: "\uD83C\uDF34",
    Quartiere: "\uD83C\uDFD9\uFE0F",
    Missione: "\u2B50",
    "Easter egg": "\uD83E\uDD5A"
  };
  const emoji = mapType[type] || "\uD83D\uDCCD";
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
  const who = p.author ? "<br>da <em>" + p.author + "</em>" : "";
  L.marker([p.lat, p.lng], { icon: pinIcon(p.type) })
    .addTo(map)
    .bindPopup("<strong>" + p.title + "</strong><br><em>" + (p.type || "") + "</em><br>" + (p.note || "") + who);
}

async function addPin() {
  const title = document.getElementById("pinTitle").value.trim();
  const type = document.getElementById("pinType").value;
  const note = document.getElementById("pinNote").value.trim();
  if (!pendingLatLng) return toast("Clicca prima un punto sulla mappa.");
  if (!title) return toast("Dai un nome alla location.");
  const who = (getOp().name || localStorage.getItem("p72_name") || "").trim();
  const pin = {
    lat: pendingLatLng.lat,
    lng: pendingLatLng.lng,
    title: title,
    type: type,
    note: note,
    author: who || null
  };
  if (!sb) return toast("Database non collegato.");
  const { error } = await sb.from("pins").insert(pin);
  if (error) toast("Errore: " + error.message);
  else toast(who ? "In coda come " + who : "In coda. Salva un nome in Profilo per firmarlo.");
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
    box.innerHTML = "<p class='hint'>Nessuna scoperta ancora.</p>";
    return;
  }
  box.innerHTML = rows.map(function (r) {
    return '<article class="item"><div class="meta"><span class="votes">\u25B2 ' +
      (r.votes || 1) + "</span> community</div><p>" + (r.body || "") + "</p></article>";
  }).join("");
}
async function addDiscovery() {
  const input = document.getElementById("discText");
  const text = (input && input.value ? input.value : "").trim();
  if (!text) return toast("Scrivi la scoperta.");
  const { error } = await sb.from("discoveries").insert({ body: text });
  if (error) return toast("Errore: " + error.message);
  input.value = "";
  toast("Pubblicata.");
  renderFeed();
}
const ticker = document.getElementById("ticker");
if (ticker) ticker.innerHTML = "<span>LAUNCH \u00b7 19 NOV 2026 &nbsp;|&nbsp; PRELOAD \u00b7 12 NOV</span>";
renderFeed();

const questions = [
  { q: "Prima ora in Leonida?", a: ["Cabrio", "Tetto e piano", "Sparatoria", "Mappa e pin"] },
  { q: "Chi maini?", a: ["Lucia", "Jason", "Switch", "Meta"] },
  { q: "Soldi day-1?", a: ["Story", "Street", "Esploro", "Crew"] },
  { q: "Cosa ti serve?", a: ["Alert", "Mappa", "Prezzi", "Pack"] }
];
const profiles = [
  { name: "Tourist armato", blurb: "Priorita mappa." },
  { name: "Planner", blurb: "Priorita tetto e prezzi." },
  { name: "Chaos", blurb: "Priorita feed e crew." },
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
      '</p><br><button class="btn primary" onclick="goConsoleOrPro()">Apri la console</button></div>';
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

function saveOperator() {
  const name = ((document.getElementById("opName") || {}).value || "").trim();
  const crew = ((document.getElementById("opCrew") || {}).value || "").trim();
  const op = getOp();
  op.name = name;
  op.crew = crew;
  localStorage.setItem("p72_name", name);
  localStorage.setItem("p72_crew", crew);
  const file = document.getElementById("opPhoto") && document.getElementById("opPhoto").files[0];
  if (!file) {
    saveJSON(STORE_OP, op);
    paintOpPreview();
    return toast("Identita salvata: " + (name || "senza nome"));
  }
  const img = new Image();
  const url = URL.createObjectURL(file);
  img.onload = function () {
    const c = document.createElement("canvas");
    const max = 320;
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    c.width = Math.round(img.width * scale);
    c.height = Math.round(img.height * scale);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    op.photo = c.toDataURL("image/jpeg", 0.72);
    URL.revokeObjectURL(url);
    saveJSON(STORE_OP, op);
    paintOpPreview();
    toast("Identita salvata: " + (name || "senza nome"));
  };
  img.src = url;
}
function paintOpPreview() {
  const op = getOp();
  const box = document.getElementById("opPreview");
  if (box) {
    if (op.photo) box.innerHTML = '<img alt="" src="' + op.photo + '">';
    else box.textContent = (op.name || "72").slice(0, 2).toUpperCase();
  }
  const n = document.getElementById("opName");
  const c = document.getElementById("opCrew");
  if (n && !n.value) n.value = op.name;
  if (c && !c.value) c.value = op.crew;
}
paintOpPreview();
function prefillLogin() {
  const op = getOp();
  const pack = loadJSON(STORE_PACK, null);
  const n = document.getElementById("loginName");
  const c = document.getElementById("loginCode");
  if (n && !n.value) n.value = op.name || "";
  if (c && !c.value && pack && pack.code) c.value = pack.code;
}
function activatePack() {
  const name = ((document.getElementById("loginName") || {}).value || getOp().name || "").trim();
  const code = ((document.getElementById("loginCode") || {}).value || "").trim();
  if (!name) return toast("Serve un nome operatore.");
  if (code.length < 4) return toast("Codice pack: almeno 4 caratteri.");
  const op = getOp();
  op.name = name;
  saveJSON(STORE_OP, op);
  localStorage.setItem("p72_name", name);
  saveJSON(STORE_PACK, { name: name, code: code, at: Date.now() });
  localStorage.setItem(STORE_SESSION, "1");
  refreshNav();
  toast("Pack attivo. Conserva il codice " + code);
  show("dash");
}
function loginConsole() {
  const name = ((document.getElementById("loginName") || {}).value || "").trim();
  const code = ((document.getElementById("loginCode") || {}).value || "").trim();
  const pack = loadJSON(STORE_PACK, null);
  if (!pack) return toast("Nessun pack su questo browser. Usa Attiva pack.");
  if (name !== pack.name || code !== pack.code) return toast("Nome o codice non coincidono.");
  localStorage.setItem(STORE_SESSION, "1");
  refreshNav();
  toast("Bentornato, " + pack.name);
  show("dash");
}
function logoutConsole() {
  localStorage.removeItem(STORE_SESSION);
  refreshNav();
  toast("Uscito. Rientri da Pro con nome + codice.");
  show("home");
}
function renderChecks() {
  const box = document.getElementById("checkList");
  if (!box) return;
  let state = loadJSON(STORE_CHECK, []);
  if (state.length !== CHECKS.length) state = CHECKS.map(function () { return false; });
  box.innerHTML = CHECKS.map(function (label, i) {
    return '<label class="check-row"><input type="checkbox" data-i="' + i + '"' +
      (state[i] ? " checked" : "") + "> <span>" + label + "</span></label>";
  }).join("");
  box.querySelectorAll("input").forEach(function (el) {
    el.addEventListener("change", function () {
      const cur = loadJSON(STORE_CHECK, CHECKS.map(function () { return false; }));
      cur[Number(el.getAttribute("data-i"))] = el.checked;
      saveJSON(STORE_CHECK, cur);
      updateKpiCheck();
    });
  });
  updateKpiCheck();
}
function updateKpiCheck() {
  const state = loadJSON(STORE_CHECK, []);
  const done = state.filter(Boolean).length;
  const el = document.getElementById("kpiDone");
  if (el) el.textContent = done + "/" + CHECKS.length;
}
function renderDash() {
  const op = getOp();
  const pack = loadJSON(STORE_PACK, null);
  const nameEl = document.getElementById("dashName");
  const crewEl = document.getElementById("dashCrew");
  const av = document.getElementById("dashAvatar");
  const hint = document.getElementById("reentryHint");
  if (nameEl) nameEl.textContent = op.name || (pack && pack.name) || "Operatore";
  if (crewEl) crewEl.textContent = op.crew || "senza crew";
  if (hint && pack) hint.textContent = "Pro. Entra. Nome: " + pack.name + " + il tuo codice.";
  if (av) {
    if (op.photo) av.innerHTML = '<img alt="" src="' + op.photo + '">';
    else av.textContent = ((op.name || "72")).slice(0, 2).toUpperCase();
  }
  const mail = loadJSON(STORE_ALERT, null);
  const dashEmail = document.getElementById("dashEmail");
  if (dashEmail && mail && mail.email) dashEmail.value = mail.email;
  renderChecks();
  loadMyPins();
}
async function loadMyPins() {
  const box = document.getElementById("myPins");
  const kpi = document.getElementById("kpiPins");
  if (!box || !sb) return;
  const op = getOp();
  const pack = loadJSON(STORE_PACK, null);
  const who = op.name || (pack && pack.name) || "";
  if (!who) {
    box.textContent = "Salva un nome in Profilo.";
    if (kpi) kpi.textContent = "0";
    return;
  }
  const { data } = await sb.from("pins").select("*").eq("author", who).order("created_at", { ascending: false });
  if (kpi) kpi.textContent = String((data || []).length);
  if (!data || !data.length) {
    box.textContent = "Nessun pin firmato ancora.";
    return;
  }
  box.innerHTML = data.map(function (p) {
    return "<p><strong>" + p.title + "</strong> \u00b7 " + (p.approved ? "LIVE" : "in coda") + "</p>";
  }).join("");
}
function saveAlert() {
  const email = (document.getElementById("alertEmail") || {}).value || "";
  if (!email.includes("@")) return toast("Email non valida.");
  saveJSON(STORE_ALERT, { email: email, at: Date.now() });
  toast("Alert salvato in locale.");
}
function saveAlertFromDash() {
  const email = (document.getElementById("dashEmail") || {}).value || "";
  if (!email.includes("@")) return toast("Email non valida.");
  saveJSON(STORE_ALERT, { email: email, at: Date.now() });
  toast("Alert salvato.");
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
        .bindPopup("<strong>" + p.title + "</strong><br>" + (p.author || "anon"));
      bounds.push([p.lat, p.lng]);
    }
  });
  if (m && bounds.length) m.fitBounds(bounds, { padding: [28, 28] });
  box.innerHTML = data.map(function (p) {
    return '<article class="card" style="margin-bottom:10px"><h3>' + p.title +
      "</h3><p>" + (p.type || "") + " \u00b7 " + (p.author || "anon") + " \u00b7 " + (p.note || "") +
      "</p><p>Coord: " + Number(p.lat).toFixed(5) + ", " + Number(p.lng).toFixed(5) + "</p>" +
      '<button class="btn ghost" type="button" onclick="focusPending(' + p.lat + "," + p.lng + ')">Centra</button> ' +
      '<button class="btn primary" type="button" onclick="modPin(\'' + p.id + '\', true)">Approva</button> ' +
      '<button class="btn ghost" type="button" onclick="modPin(\'' + p.id + '\', false)">Elimina</button></article>';
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
show(currentView(), true);
