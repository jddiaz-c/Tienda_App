/**
 * modules/productos.js — global, no modules.
 */

let _prodData = [];
let _prodCats = [];

const _fmtProd = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

function _stockClass(p) {
  if (p.cantidad === 0) return 'stock-crit';
  if (p.cantidad < p.stock_minimo) return 'stock-warn';
  return 'stock-ok';
}

async function mountProductos() {
  _prodCats = await categoriaApi.all().catch(() => []);
  await _loadProductos();
}

async function _loadProductos(filter = '') {
  const el = document.getElementById('view-productos');
  el.innerHTML = `
    <div class="section-head">
      <div>
        <p class="section-head__eyebrow">Gestión</p>
        <h2 class="section-head__title">Productos</h2>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div class="search-bar">
          <span>🔍</span>
          <input id="prod-search" type="text" placeholder="Buscar…" value="${filter}">
        </div>
        <button class="btn btn-primary" id="btn-new-prod">+ Nuevo</button>
      </div>
    </div>
    <div class="panel">
      <div class="loading-row"><div class="spinner"></div> Cargando…</div>
    </div>`;

  document.getElementById('prod-search').addEventListener('input', e => _renderProdTable(e.target.value.toLowerCase()));
  document.getElementById('btn-new-prod').addEventListener('click', () => _openProdForm());

  try {
    _prodData = await productoApi.all();
    _renderProdTable(filter);
  } catch (err) {
    toast.error(err.message);
  }
}

function _renderProdTable(filter = '') {
  const panel = document.querySelector('#view-productos .panel');
  const rows = filter
    ? _prodData.filter(p => p.nombre.toLowerCase().includes(filter) || p.codigo.toLowerCase().includes(filter))
    : _prodData;

  panel.innerHTML = `
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Código</th><th>Nombre</th><th>Categoría</th>
            <th>Precio</th><th>Stock</th><th>Empaque</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${rows.length === 0
            ? `<tr><td colspan="7" class="table__empty">Sin resultados</td></tr>`
            : rows.map(p => `
              <tr>
                <td><span class="mono">${p.codigo}</span></td>
                <td style="font-weight:500">${p.nombre}</td>
                <td style="text-transform:capitalize">${p.categoria?.nombre || '—'}</td>
                <td>${_fmtProd(p.precio)}</td>
                <td class="${_stockClass(p)}">${p.cantidad} <small style="font-weight:400;opacity:.6">/ mín ${p.stock_minimo}</small></td>
                <td><span class="badge badge-neutral">${p.tipo_empaque}</span></td>
                <td><div class="actions-cell">
                  <button class="btn btn-sm btn-soft" data-edit="${p.id}">✏️</button>
                  <button class="btn btn-sm btn-danger" data-del="${p.id}">🗑️</button>
                </div></td>
              </tr>`).join('')}
        </tbody>
      </table>
    </div>`;

  panel.querySelectorAll('[data-edit]').forEach(b =>
    b.addEventListener('click', () => _openProdForm(_prodData.find(p => p.id == b.dataset.edit))));
  panel.querySelectorAll('[data-del]').forEach(b =>
    b.addEventListener('click', () => _confirmProdDelete(b.dataset.del)));
}

function _prodFormHTML(data = {}) {
  const catOptions = _prodCats.map(c =>
    `<option value="${c.id}" ${data.categoria_id == c.id ? 'selected' : ''} style="text-transform:capitalize">${c.nombre} (${c.impuesto}%)</option>`
  ).join('');

  return `
    <form class="form-grid" id="prod-form">
      <div class="form-grid form-grid-2">
        <div class="field">
          <label>Código</label>
          <input name="codigo" type="text" value="${data.codigo || ''}" placeholder="ej. PROD-001" required>
        </div>
        <div class="field">
          <label>Nombre</label>
          <input name="nombre" type="text" value="${data.nombre || ''}" placeholder="ej. Cuaderno universitario" required>
        </div>
        <div class="field">
          <label>Precio Unitario ($)</label>
          <input name="precio" type="number" step="0.01" min="0" value="${data.precio || ''}" required>
        </div>
        <div class="field">
          <label>Peso (kg)</label>
          <input name="peso" type="number" step="0.01" min="0" value="${data.peso || ''}" required>
        </div>
        <div class="field">
          <label>Cantidad en Stock</label>
          <input name="cantidad" type="number" min="0" value="${data.cantidad ?? ''}" required>
        </div>
        <div class="field">
          <label>Stock Mínimo</label>
          <input name="stock_minimo" type="number" min="1" value="${data.stock_minimo ?? 5}" required>
        </div>
        <div class="field">
          <label>Tipo Empaque</label>
          <select name="tipo_empaque" required>
            <option value="">Seleccionar…</option>
            <option value="carton"   ${data.tipo_empaque === 'carton'   ? 'selected' : ''}>Cartón</option>
            <option value="plastico" ${data.tipo_empaque === 'plastico' ? 'selected' : ''}>Plástico</option>
            <option value="otro"     ${data.tipo_empaque === 'otro'     ? 'selected' : ''}>Otro</option>
          </select>
        </div>
        <div class="field">
          <label>Categoría</label>
          <select name="categoria_id" required>
            <option value="">Seleccionar…</option>
            ${catOptions}
          </select>
        </div>
      </div>
      <div class="modal__footer">
        <button type="button" class="btn btn-outline" id="prod-cancel">Cancelar</button>
        <button type="submit" class="btn btn-primary" id="prod-submit">Guardar</button>
      </div>
    </form>`;
}

function _openProdForm(data = null) {
  const isEdit = !!data;
  const m = Modal.create({ title: isEdit ? 'Editar Producto' : 'Nuevo Producto', content: _prodFormHTML(data || {}), wide: true });
  m.open();
  const form = m.getBody().querySelector('#prod-form');
  m.getBody().querySelector('#prod-cancel').onclick = () => m.close();

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('#prod-submit');
    btn.disabled = true; btn.textContent = 'Guardando…';
    const payload = {
      codigo:       form.codigo.value.trim(),
      nombre:       form.nombre.value.trim(),
      precio:       parseFloat(form.precio.value),
      peso:         parseFloat(form.peso.value),
      cantidad:     parseInt(form.cantidad.value),
      stock_minimo: parseInt(form.stock_minimo.value),
      tipo_empaque: form.tipo_empaque.value,
      categoria_id: parseInt(form.categoria_id.value),
    };
    try {
      if (isEdit) await productoApi.update(data.id, payload);
      else        await productoApi.create(payload);
      toast.ok(isEdit ? 'Producto actualizado' : 'Producto creado');
      m.close();
      await _loadProductos();
    } catch (err) {
      toast.error(err.message);
      btn.disabled = false; btn.textContent = 'Guardar';
    }
  });
}

function _confirmProdDelete(id) {
  const prod = _prodData.find(p => p.id == id);
  const m = Modal.create({
    title: 'Eliminar Producto',
    content: `
      <p>¿Eliminar <strong>${prod?.nombre}</strong>? Esta acción no se puede deshacer.</p>
      <div class="modal__footer">
        <button class="btn btn-outline" id="del-cancel">Cancelar</button>
        <button class="btn btn-danger" id="del-confirm">Eliminar</button>
      </div>`,
  });
  m.open();
  m.getBody().querySelector('#del-cancel').onclick = () => m.close();
  m.getBody().querySelector('#del-confirm').addEventListener('click', async () => {
    try {
      await productoApi.remove(id);
      toast.ok('Producto eliminado');
      m.close();
      await _loadProductos();
    } catch (err) {
      toast.error(err.message);
    }
  });
}
