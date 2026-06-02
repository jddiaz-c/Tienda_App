/**
 * modules/proveedores.js — global, no modules.
 */

let _provData = [];

async function mountProveedores() {
  await _loadProveedores();
}

async function _loadProveedores(filter = '') {
  const el = document.getElementById('view-proveedores');
  el.innerHTML = `
    <div class="section-head">
      <div>
        <p class="section-head__eyebrow">Gestión</p>
        <h2 class="section-head__title">Proveedores</h2>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <div class="search-bar">
          <span>🔍</span>
          <input id="prov-search" type="text" placeholder="Buscar por nombre o ciudad…" value="${filter}">
        </div>
        <button class="btn btn-primary" id="btn-new-prov">+ Nuevo</button>
      </div>
    </div>
    <div class="panel">
      <div class="loading-row"><div class="spinner"></div> Cargando…</div>
    </div>`;

  document.getElementById('prov-search').addEventListener('input', e => _renderProvTable(e.target.value.toLowerCase()));
  document.getElementById('btn-new-prov').addEventListener('click', () => _openProvForm());

  try {
    _provData = await proveedorApi.all();
    _renderProvTable(filter);
  } catch (err) {
    toast.error(err.message);
  }
}

function _renderProvTable(filter = '') {
  const panel = document.querySelector('#view-proveedores .panel');
  const rows = filter
    ? _provData.filter(p => p.nombre.toLowerCase().includes(filter) || p.ciudad.toLowerCase().includes(filter))
    : _provData;

  panel.innerHTML = `
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr><th>ID</th><th>Nombre</th><th>Teléfono</th><th>Ciudad</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          ${rows.length === 0
            ? `<tr><td colspan="5" class="table__empty">Sin resultados</td></tr>`
            : rows.map(p => `
              <tr>
                <td>${p.id}</td>
                <td style="font-weight:500">${p.nombre}</td>
                <td>${p.telefono}</td>
                <td>${p.ciudad}</td>
                <td><div class="actions-cell">
                  <button class="btn btn-sm btn-soft" data-edit="${p.id}">✏️</button>
                  <button class="btn btn-sm btn-danger" data-del="${p.id}">🗑️</button>
                </div></td>
              </tr>`).join('')}
        </tbody>
      </table>
    </div>`;

  panel.querySelectorAll('[data-edit]').forEach(b =>
    b.addEventListener('click', () => _openProvForm(_provData.find(p => p.id == b.dataset.edit))));
  panel.querySelectorAll('[data-del]').forEach(b =>
    b.addEventListener('click', () => _confirmProvDelete(b.dataset.del)));
}

function _provFormHTML(data = {}) {
  return `
    <form class="form-grid" id="prov-form">
      <div class="field">
        <label>Nombre</label>
        <input name="nombre" type="text" value="${data.nombre || ''}" placeholder="Nombre del proveedor" required>
      </div>
      <div class="form-grid form-grid-2">
        <div class="field">
          <label>Teléfono</label>
          <input name="telefono" type="text" value="${data.telefono || ''}" placeholder="Solo números" required>
        </div>
        <div class="field">
          <label>Ciudad</label>
          <input name="ciudad" type="text" value="${data.ciudad || ''}" placeholder="Ciudad de procedencia" required>
        </div>
      </div>
      <div class="modal__footer">
        <button type="button" class="btn btn-outline" id="prov-cancel">Cancelar</button>
        <button type="submit" class="btn btn-primary" id="prov-submit">Guardar</button>
      </div>
    </form>`;
}

function _openProvForm(data = null) {
  const isEdit = !!data;
  const m = Modal.create({ title: isEdit ? 'Editar Proveedor' : 'Nuevo Proveedor', content: _provFormHTML(data || {}) });
  m.open();
  const form = m.getBody().querySelector('#prov-form');
  m.getBody().querySelector('#prov-cancel').onclick = () => m.close();

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('#prov-submit');
    btn.disabled = true; btn.textContent = 'Guardando…';
    const payload = {
      nombre:   form.nombre.value.trim(),
      telefono: form.telefono.value.trim(),
      ciudad:   form.ciudad.value.trim(),
    };
    try {
      if (isEdit) await proveedorApi.update(data.id, payload);
      else        await proveedorApi.create(payload);
      toast.ok(isEdit ? 'Proveedor actualizado' : 'Proveedor creado');
      m.close();
      await _loadProveedores();
    } catch (err) {
      toast.error(err.message);
      btn.disabled = false; btn.textContent = 'Guardar';
    }
  });
}

function _confirmProvDelete(id) {
  const prov = _provData.find(p => p.id == id);
  const m = Modal.create({
    title: 'Eliminar Proveedor',
    content: `
      <p>¿Eliminar al proveedor <strong>${prov?.nombre}</strong> de ${prov?.ciudad}?</p>
      <div class="modal__footer">
        <button class="btn btn-outline" id="del-cancel">Cancelar</button>
        <button class="btn btn-danger" id="del-confirm">Eliminar</button>
      </div>`,
  });
  m.open();
  m.getBody().querySelector('#del-cancel').onclick = () => m.close();
  m.getBody().querySelector('#del-confirm').addEventListener('click', async () => {
    try {
      await proveedorApi.remove(id);
      toast.ok('Proveedor eliminado');
      m.close();
      await _loadProveedores();
    } catch (err) {
      toast.error(err.message);
    }
  });
}
