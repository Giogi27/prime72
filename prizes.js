function stampPrizes() {
  const it = {
    prizeTitle: "Premi stagione 1",
    prizeBody: "1° 100 € PlayStation Store · 2° 50 € · 3° 25 €. Codici via email a fine stagione."
  };
  if (window.I18N && I18N.it) {
    I18N.it.prizeTitle = it.prizeTitle;
    I18N.it.prizeBody = it.prizeBody;
  }
  document.querySelectorAll('[data-i18n="prizeTitle"]').forEach(function (el) {
    el.textContent = it.prizeTitle;
  });
  document.querySelectorAll('[data-i18n="prizeBody"]').forEach(function (el) {
    el.textContent = it.prizeBody;
  });
}
setTimeout(stampPrizes, 0);
setTimeout(stampPrizes, 200);
