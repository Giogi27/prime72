window.prefillLogin = function () {};

(function wipePublicFields() {
  function clear() {
    ["loginName", "loginCode", "opName", "opCrew"].forEach(function (id) {
      const el = document.getElementById(id);
      if (!el) return;
      el.value = "";
      el.setAttribute("autocomplete", "off");
      el.setAttribute("autocorrect", "off");
      el.setAttribute("autocapitalize", "off");
      el.setAttribute("spellcheck", "false");
    });
  }
  const prev = window.paintOpPreview;
  window.paintOpPreview = function () {
    if (typeof prev === "function") prev();
    const n = document.getElementById("opName");
    const c = document.getElementById("opCrew");
    if (n) n.value = "";
    if (c) c.value = "";
  };
  clear();
  setTimeout(clear, 80);
  setTimeout(clear, 400);
})();
