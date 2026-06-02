/**
 * core/toast.js — global, no modules.
 */

const toast = (() => {
  let container = null;

  function getContainer() {
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  function show(message, type = '', duration = 3400) {
    const el = document.createElement('div');
    el.className = `toast${type ? ' toast-' + type : ''}`;
    el.textContent = message;
    getContainer().appendChild(el);
    setTimeout(() => {
      el.classList.add('hide');
      setTimeout(() => el.remove(), 300);
    }, duration);
  }

  return {
    ok:    (msg) => show(msg, 'ok'),
    error: (msg) => show(msg, 'error'),
    info:  (msg) => show(msg, ''),
  };
})();
