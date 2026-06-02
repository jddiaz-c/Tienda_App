/**
 * modules/clientes.js — global, no modules.
 */

let _cliData = [];

async function mountClientes() {
  await _loadClientes();
}

async function _loadClientes(filter = '') {
  const el = document.getElementById('view-clientes');
  el.innerHTML = `
    <div class="section-head">
      <div>
        <p class="section-head__eyebrow">Gestión</p>
        <h2 class="section-head__title">Clientes</h2>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <div class="search-bar">
          <span>🔍</span>
          <input id="cli-search" type="text" placeholder="Buscar por nombre o cédula…" value="${filter}">
        </div>
        <button class="btn btn-primary" id="btn-new-cli">+ Nuevo</button>
      </div>
    </div>
    <div class="panel">
      <div class="loading-row"><div class="spinner"></div> Cargando…</div>
    </div>`;

  document.getElementById('cli-search').addEventListener('input', e => _renderCliTable(e.target.value.toLowerCase()));
  document.getElementById('btn-new-cli').addEventListener('click', () => _openCliForm());

  try {
    _cliData = await clienteApi.all();
    _renderCliTable(filter);
  } catch (err) {
    toast.error(err.message);
  }
}

function _renderCliTable(filter = '') {
  const panel = document.querySelector('#view-clientes .panel');
  const rows = filter
    ? _cliData.filter(c =>
        `${c.nombre} ${c.apellido}`.toLowerCase().includes(filter) ||
        c.cedula.includes(filter) ||
        c.correo.toLowerCase().includes(filter))
    : _cliData;

  panel.innerHTML = `
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr><th>Cédula</th><th>Nombre</th><th>Teléfono</th><th>Correo</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          ${rows.length === 0
            ? `<tr><td colspan="5" class="table__empty">Sin resultados</td></tr>`
            : rows.map(c => `
              <tr>
                <td><span class="mono">${c.cedula}</span></td>
                <td style="font-weight:500">${c.nombre} ${c.apellido}</td>
                <td>${c.telefono}</td>
                <td>${c.correo}</td>
                <td><div class="actions-cell">
                  <button class="btn btn-sm btn-soft" data-edit="${c.id}">✏️</button>
                  <button class="btn btn-sm btn-danger" data-del="${c.id}">🗑️</button>
                </div></td>
              </tr>`).join('')}
        </tbody>
      </table>
    </div>`;

  panel.querySelectorAll('[data-edit]').forEach(b =>
    b.addEventListener('click', () => _openCliForm(_cliData.find(c => c.id == b.dataset.edit))));
  panel.querySelectorAll('[data-del]').forEach(b =>
    b.addEventListener('click', () => _confirmCliDelete(b.dataset.del)));
}

function _cliFormHTML(data = {}) {
  return `
    <form class="form-grid" id="cli-form">
      <div class="form-grid form-grid-2">
        <div class="field">
          <label>Cédula</label>
          <input name="cedula" type="text" value="${data.cedula || ''}" placeholder="Número de documento" required>
        </div>
        <div class="field">
          <label>Teléfono</label>
          <input name="telefono" type="text" value="${data.telefono || ''}" placeholder="Solo números" required>
        </div>
        <div class="field">
          <label>Nombre</label>
          <input name="nombre" type="text" value="${data.nombre || ''}" placeholder="Nombre(s)" required>
        </div>
        <div class="field">
          <label>Apellido</label>
          <input name="apellido" type="text" value="${data.apellido || ''}" placeholder="Apellido(s)" required>
        </div>
      </div>
      <div class="field">
        <label>Correo Electrónico</label>
        <input name="correo" type="email" value="${data.correo || ''}" placeholder="correo@ejemplo.com" required>
      </div>
      <div class="modal__footer">
        <button type="button" class="btn btn-outline" id="cli-cancel">Cancelar</button>
        <button type="submit" class="btn btn-primary" id="cli-submit">Guardar</button>
      </div>
    </form>`;
}

function _openCliForm(data = null) {
  const isEdit = !!data;
  const m = Modal.create({ title: isEdit ? 'Editar Cliente' : 'Nuevo Cliente', content: _cliFormHTML(data || {}), wide: true });
  m.open();
  const form = m.getBody().querySelector('#cli-form');
  m.getBody().querySelector('#cli-cancel').onclick = () => m.close();

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('#cli-submit');
    btn.disabled = true; btn.textContent = 'Guardando…';
    const payload = {
      cedula:   form.cedula.value.trim(),
      nombre:   form.nombre.value.trim(),
      apellido: form.apellido.value.trim(),
      telefono: form.telefono.value.trim(),
      correo:   form.correo.value.trim(),
    };
    try {
      if (isEdit) await clienteApi.update(data.id, payload);
      else        await clienteApi.create(payload);
      toast.ok(isEdit ? 'Cliente actualizado' : 'Cliente registrado');
      m.close();
      await _loadClientes();
    } catch (err) {
      toast.error(err.message);
      btn.disabled = false; btn.textContent = 'Guardar';
    }
  });
}

function _confirmCliDelete(id) {
  const cli = _cliData.find(c => c.id == id);
  const m = Modal.create({
    title: 'Eliminar Cliente',
    content: `
      <p>¿Eliminar a <strong>${cli?.nombre} ${cli?.apellido}</strong>?</p>
      <div class="modal__footer">
        <button class="btn btn-outline" id="del-cancel">Cancelar</button>
        <button class="btn btn-danger" id="del-confirm">Eliminar</button>
      </div>`,
  });
  m.open();
  m.getBody().querySelector('#del-cancel').onclick = () => m.close();
  m.getBody().querySelector('#del-confirm').addEventListener('click', async () => {
    try {
      await clienteApi.remove(id);
      toast.ok('Cliente eliminado');
      m.close();
      await _loadClientes();
    } catch (err) {
      toast.error(err.message);
    }
  });
}
