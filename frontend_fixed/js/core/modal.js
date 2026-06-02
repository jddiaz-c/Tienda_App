/**
 * core/modal.js — global, no modules.
 */

class Modal {
  constructor({ title = '', content = '', wide = false, onClose } = {}) {
    this._onClose = onClose;
    this._backdrop = null;
    this._title = title;
    this._content = content;
    this._wide = wide;
  }

  static create(opts) { return new Modal(opts); }

  open() {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal${this._wide ? ' modal--wide' : ''}">
        <div class="modal__header">
          <h2 class="modal__title">${this._title}</h2>
          <button class="modal__close" aria-label="Cerrar">✕</button>
        </div>
        <div class="modal__body">${this._content}</div>
      </div>`;

    backdrop.querySelector('.modal__close').addEventListener('click', () => this.close());
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) this.close(); });

    document.body.appendChild(backdrop);
    document.body.style.overflow = 'hidden';
    this._backdrop = backdrop;
    return this;
  }

  close() {
    if (!this._backdrop) return;
    this._backdrop.classList.add('closing');
    setTimeout(() => {
      this._backdrop?.remove();
      this._backdrop = null;
      document.body.style.overflow = '';
      this._onClose?.();
    }, 160);
  }

  setContent(html) {
    if (this._backdrop) {
      this._backdrop.querySelector('.modal__body').innerHTML = html;
    }
    return this;
  }

  setTitle(t) {
    if (this._backdrop) this._backdrop.querySelector('.modal__title').textContent = t;
    this._title = t;
    return this;
  }

  getBody() {
    return this._backdrop?.querySelector('.modal__body');
  }
}
