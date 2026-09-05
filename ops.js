function opsTab(name) {
  document.querySelectorAll(".ops-pane").forEach(function (p) { p.classList.remove("on"); });
  document.querySelectorAll(".ops-tabs button").forEach(function (b) {
    b.classList.toggle("on", b.getAttribute("data-ops") === name);
  });
  const pane = document.getElementById("ops-" + name);
  if (pane) pane.classList.add("on");
  if (name === "coda" && typeof ensureAdminMap === "function") {
    setTimeout(function () {
      const m = ensureAdminMap();
      if (m) m.invalidateSize();
    }, 80);
  }
}

async function bootOps() {
  const secretEl = document.getElementById("adminSecret");
  const secret = (secretEl && secretEl.value ? secretEl.value : "").trim();
  if (!secret) return toast("Password admin.");
  sessionStorage.setItem("p72_admin", secret);
  if (typeof loadPending === "function") await loadPending();
  await loadOpsLive();
  await loadOpsInbox();
  await loadOpsSala();
}

async function loadOpsLive() {
  const box = document.getElementById("opsLiveList");
  const kpi = document.getElementById("kpiLive");
  if (!box || !sb) return;
  const { data, error } = await sb.from("pins").select("*").eq("approved", true).order("created_at", { ascending: false }).limit(80);
  if (error) {
    box.innerHTML = "<p class='hint'>" + error.message + "</p>";
    return;
  }
  if (kpi) kpi.textContent = String((data || []).length);
  if (!data || !data.length) {
    box.innerHTML = "<p class='hint'>Nessun pin live.</p>";
    return;
  }
  box.innerHTML = data.map(function (p) {
    return '<article class="ops-card"><h3>' + (p.title || "") +
      "</h3><p>" + (p.type || "") + " · " + (p.author || "anon") +
      "</p><p class='hint'>" + Number(p.lat).toFixed(4) + ", " + Number(p.lng).toFixed(4) + "</p></article>";
  }).join("");
}

async function loadOpsInbox() {
  const box = document.getElementById("adminInbox");
  const kpi = document.getElementById("kpiMsg");
  if (!box || !sb) return;
  const { data, error } = await sb.from("inbox").select("*").order("created_at", { ascending: false }).limit(80);
  if (error) {
    box.innerHTML = "<p class='hint'>Incolla inbox.sql in Supabase.</p>";
    if (kpi) kpi.textContent = "0";
    return;
  }
  if (kpi) kpi.textContent = String((data || []).length);
  if (!data || !data.length) {
    box.innerHTML = "<p class='hint'>Nessun messaggio.</p>";
    return;
  }
  box.innerHTML = data.map(function (m) {
    const when = m.created_at ? new Date(m.created_at).toLocaleString() : "";
    return '<article class="ops-card"><p><strong>' + (m.author || "?") +
      "</strong> · " + (m.email || "no email") + "</p><p>" + (m.body || "") +
      "</p><p class='hint'>" + when + "</p></article>";
  }).join("");
}

async function loadOpsSala() {
  const box = document.getElementById("opsSala");
  const kpi = document.getElementById("kpiSala");
  if (!box || !sb) return;
  const { data, error } = await sb.from("sala").select("*").order("created_at", { ascending: false }).limit(80);
  if (error) {
    box.innerHTML = "<p class='hint'>Sala non disponibile.</p>";
    return;
  }
  if (kpi) kpi.textContent = String((data || []).length);
  if (!data || !data.length) {
    box.innerHTML = "<p class='hint'>Sala vuota.</p>";
    return;
  }
  box.innerHTML = data.map(function (r) {
    return '<article class="ops-card"><p><strong>' + (r.author || "?") +
      "</strong></p><p>" + (r.body || "") + "</p></article>";
  }).join("");
}

(function hookOpsKpi() {
  const prev = window.loadPending;
  window.loadPending = async function () {
    if (typeof prev === "function") await prev();
    const box = document.getElementById("adminList");
    const kpi = document.getElementById("kpiPend");
    if (!kpi || !box) return;
    const n = box.querySelectorAll("article").length;
    kpi.textContent = box.textContent.indexOf("Nessun pin") >= 0 ? "0" : String(n);
  };
})();

(function restoreOps() {
  const saved = sessionStorage.getItem("p72_admin");
  const el = document.getElementById("adminSecret");
  if (saved && el && !el.value) el.value = saved;
})();
