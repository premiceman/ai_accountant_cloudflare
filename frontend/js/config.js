// frontend/js/config.js
(function () {
  const BASE = ''; // same-origin: Pages Functions serve /api/*
  window.API = {
    base: BASE,
    url: (p) => (p && p.startsWith('http')) ? p : (BASE + (p || ''))
  };
})();
