function stampProPerks() {
  const map = {
    perkCheat: "Cheat e comandi di gioco — dal 19 novembre.",
    perkDash: "Dashboard account: pin, sala, vault, gestione abbonamento.",
    proLead: "Guide, cheat, sala, pin, gara e dashboard.",
    pack3: "Cheat dal 19 novembre"
  };
  if (window.I18N) {
    Object.keys(I18N).forEach(function (lang) {
      I18N[lang].perkCheat = I18N[lang].perkCheat && lang !== "it" ? I18N[lang].perkCheat : map.perkCheat;
      I18N[lang].perkDash = map.perkDash;
      if (lang === "it") {
        I18N[lang].perkCheat = map.perkCheat;
        I18N[lang].proLead = map.proLead;
        I18N[lang].pack3 = map.pack3;
      }
    });
    if (I18N.en) {
      I18N.en.perkCheat = "Cheats and in-game commands — from 19 November.";
      I18N.en.perkDash = "Account dashboard: pins, room, vault, billing.";
    }
  }
  Object.keys(map).forEach(function (key) {
    document.querySelectorAll('[data-i18n="' + key + '"]').forEach(function (el) {
      el.textContent = map[key];
    });
  });
}
setTimeout(stampProPerks, 0);
setTimeout(stampProPerks, 120);
setTimeout(stampProPerks, 400);
