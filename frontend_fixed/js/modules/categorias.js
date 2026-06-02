/**
 * modules/categorias.js — global, no modules.
 */

async function mountCategorias() {
  await _loadCategorias();
}

let _catData = [];

async function _loadCategorias(filter = '') {
  const el = document.getElementById('view-categorias');
  el.innerHTML = `
    <div class="section-head">
      <div>
        <p class="section-head__eyebrow">Gestión</p>
        <h2 class="section-head__title">Categorías</h2>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <div class="search-bar">
          <span>🔍</span>
          <input id="cat-search" type="text" placeholder="Buscar categoría…" value="${filter}">
        </div>
        <button class="btn btn-primary" id="btn-new-cat">+ Nueva</button>
      </div>
    </div>
    <div class="panel">
      <div class="loading-row"><div class="spinner"></div> Cargando…</div>
    </div>`;

  document.getElementById('cat-search').addEventListener('input', e => {
    _renderCatTable(e.target.value.toLowerCase());
  });
  document.getElementById('btn-new-cat').addEventListener('click', _openCatCreateModal);

  try {
    _catData = await categoriaApi.all();
    _renderCatTable(filter);
  } catch (err) {
    toast.error(err.message);
  }
}

function _renderCatTable(filter = '') {
  const panel = document.querySelector('#view-categorias .panel');
  const rows = filter ? _catData.filter(c => c.nombre.toLowerCase().includes(filter)) : _catData;

  panel.innerHTML = `
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr><th>ID</th><th>Nombre</th><th>Impuesto</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          ${rows.length === 0
            ? `<tr><td colspan="4" class="table__empty">Sin resultados</td></tr>`
            : rows.map(c => `
              <tr>
                <td>${c.id}</td>
                <td style="text-transform:capitalize;font-weight:500">${c.nombre}</td>
                <td>${c.impuesto}%</td>
                <td><div class="actions-cell">
                  <button class="btn btn-sm btn-soft" data-edit="${c.id}">✏️ Editar</button>
                  <button class="btn btn-sm btn-danger" data-del="${c.id}">🗑️</button>
                </div></td>
              </tr>`).join('')}
        </tbody>
      </table>
    </div>`;

  panel.querySelectorAll('[data-edit]').forEach(b =>
    b.addEventListener('click', () => _openCatEditModal(_catData.find(c => c.id == b.dataset.edit))));
  panel.querySelectorAll('[data-del]').forEach(b =>
    b.addEventListener('click', () => _confirmCatDelete(b.dataset.del)));
}

function _catForm(data = {}) {
  return `
    <form class="form-grid" id="cat-form">
      <div class="field">
        <label>Nombre</label>
        <input name="nombre" type="text" value="${data.nombre || ''}" placeholder="ej. papelería" required>
      </div>
      <div class="field">
        <label>Impuesto (%)</label>
        <input name="impuesto" type="number" step="0.01" min="0" max="100" value="${data.impuesto ?? ''}" placeholder="ej. 7" required>
      </div>
      <div class="modal__footer">
        <button type="button" class="btn btn-outline" id="cat-cancel">Cancelar</button>
        <button type="submit" class="btn btn-primary" id="cat-submit">Guardar</button>
      </div>
    </form>`;
}

function _openCatCreateModal() {
  const m = Modal.create({ title: 'Nueva Categoría', content: _catForm() });
  m.open();
  const form = m.getBody().querySelector('#cat-form');
  m.getBody().querySelector('#cat-cancel').onclick = () => m.close();
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('#cat-submit');
    btn.disabled = true; btn.textContent = 'Guardando…';
    try {
      await categoriaApi.create({ nombre: form.nombre.value.trim(), impuesto: parseFloat(form.impuesto.value) });
      toast.ok('Categoría creada');
      m.close();
      await _loadCategorias();
    } catch (err) {
      toast.error(err.message);
      btn.disabled = false; btn.textContent = 'Guardar';
    }
  });
}

function _openCatEditModal(cat) {
  const m = Modal.create({ title: 'Editar Categoría', content: _catForm(cat) });
  m.open();
  const form = m.getBody().querySelector('#cat-form');
  m.getBody().querySelector('#cat-cancel').onclick = () => m.close();
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('#cat-submit');
    btn.disabled = true; btn.textContent = 'Guardando…';
    try {
      await categoriaApi.update(cat.id, { nombre: form.nombre.value.trim(), impuesto: parseFloat(form.impuesto.value) });
      toast.ok('Categoría actualizada');
      m.close();
      await _loadCategorias();
    } catch (err) {
      toast.error(err.message);
      btn.disabled = false; btn.textContent = 'Guardar';
    }
  });
}

function _confirmCatDelete(id) {
  const cat = _catData.find(c => c.id == id);
  const m = Modal.create({
    title: 'Eliminar Categoría',
    content: `
      <p>¿Eliminar la categoría <strong style="text-transform:capitalize">${cat?.nombre}</strong>? Esta acción es irreversible.</p>
      <div class="modal__footer">
        <button class="btn btn-outline" id="del-cancel">Cancelar</button>
        <button class="btn btn-danger" id="del-confirm">Eliminar</button>
      </div>`,
  });
  m.open();
  m.getBody().querySelector('#del-cancel').onclick = () => m.close();
  m.getBody().querySelector('#del-confirm').addEventListener('click', async () => {
    try {
      await categoriaApi.remove(id);
      toast.ok('Categoría eliminada');
      m.close();
      await _loadCategorias();
    } catch (err) {
      toast.error(err.message);
    }
  });
}
