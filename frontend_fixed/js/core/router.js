/**
 * core/router.js — global, no modules.
 */

const router = (() => {
  const routes = {};
  let current = null;

  function activate(name) {
    if (current === name) return;
    current = name;

    document.querySelectorAll('.view').forEach(el => {
      el.classList.toggle('view--active', el.dataset.view === name);
    });

    document.querySelectorAll('.nav-link').forEach(el => {
      el.classList.toggle('active', el.dataset.nav === name);
    });

    const link = document.querySelector(`.nav-link[data-nav="${name}"]`);
    if (link) {
      const eyebrow = document.getElementById('topbar-eyebrow');
      const title   = document.getElementById('topbar-title');
      if (eyebrow) eyebrow.textContent = link.dataset.section || 'Gestión';
      if (title)   title.textContent   = link.dataset.label || name;
    }

    routes[name]?.();
  }

  return {
    on(name, fn) { routes[name] = fn; },

    go(name) {
      window.location.hash = name;
    },

    init() {
      window.addEventListener('hashchange', () => {
        const name = window.location.hash.replace('#', '') || 'dashboard';
        activate(name);
      });
      const initial = window.location.hash.replace('#', '') || 'dashboard';
      activate(initial);
    },
  };
})();
