(function () {
  if (!window.I18N) return;
  const extra = {
    it: {
      perkCheat: "Cheat e comandi di gioco — dal 19 novembre.",
      perkDash: "Dashboard account: pin, sala, vault, gestione abbonamento.",
      proLead: "Guide, cheat, sala, pin, gara e dashboard."
    },
    en: {
      perkCheat: "Cheats and in-game commands — from 19 November.",
      perkDash: "Account dashboard: pins, room, vault, billing.",
      proLead: "Guides, cheats, room, pins, race and dashboard."
    },
    es: {
      perkCheat: "Cheats y comandos — desde el 19 de noviembre.",
      perkDash: "Panel de cuenta: pines, sala, vault, suscripción.",
      proLead: "Guías, cheats, sala, pines, carrera y panel."
    },
    fr: {
      perkCheat: "Cheats et commandes — dès le 19 novembre.",
      perkDash: "Tableau de bord : pins, salon, vault, abonnement.",
      proLead: "Guides, cheats, salon, pins, course et dashboard."
    },
    de: {
      perkCheat: "Cheats und Befehle — ab 19. November.",
      perkDash: "Account-Dashboard: Pins, Raum, Vault, Abo.",
      proLead: "Guides, Cheats, Raum, Pins, Rennen und Dashboard."
    },
    pt: {
      perkCheat: "Cheats e comandos — a partir de 19 de novembro.",
      perkDash: "Dashboard da conta: pins, sala, vault, subscrição.",
      proLead: "Guias, cheats, sala, pins, corrida e dashboard."
    },
    ja: {
      perkCheat: "チートとコマンド — 11月19日から。",
      perkDash: "アカウントダッシュボード。",
      proLead: "ガイド、チート、ルーム、ピン、レース、ダッシュボード。"
    }
  };
  Object.keys(extra).forEach(function (lang) {
    if (!I18N[lang]) return;
    Object.assign(I18N[lang], extra[lang]);
  });
  if (typeof applyLang === "function") applyLang(localStorage.getItem("p72_lang") || "it");
})();
