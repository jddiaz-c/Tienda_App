/**
 * modules/compras.js — global, no modules.
 */

let _compData = [];
let _compProveedores = [];
let _compProductos = [];
let _compDetalles = [];

const _fmtComp = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

async function mountCompras() {
  [_compProveedores, _compProductos] = await Promise.all([
    proveedorApi.all().catch(() => []),
    productoApi.all().catch(() => []),
  ]);
  await _loadCompras();
}

async function _loadCompras() {
  const el = document.getElementById('view-compras');
  el.innerHTML = `
    <div class="section-head">
      <div>
        <p class="section-head__eyebrow">Gestión</p>
        <h2 class="section-head__title">Compras</h2>
      </div>
      <button class="btn btn-primary" id="btn-new-comp">+ Nueva Compra</button>
    </div>
    <div class="panel">
      <div class="loading-row"><div class="spinner"></div> Cargando…</div>
    </div>`;

  document.getElementById('btn-new-comp').addEventListener('click', _openCompForm);

  try {
    _compData = await compraApi.all();
    _renderCompTable();
  } catch (err) {
    toast.error(err.message);
  }
}

function _renderCompTable() {
  const panel = document.querySelector('#view-compras .panel');
  panel.innerHTML = `
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr><th>ID</th><th>Fecha</th><th>Proveedor</th><th>Productos</th><th>Total</th><th>Detalle</th></tr>
        </thead>
        <tbody>
          ${_compData.length === 0
            ? `<tr><td colspan="6" class="table__empty">No hay compras registradas</td></tr>`
            : _compData.map(c => `
              <tr>
                <td>#${c.id}</td>
                <td>${c.fecha}</td>
                <td>${c.proveedor?.nombre || '—'}</td>
                <td>${c.detalles?.length || 0} ítem(s)</td>
                <td style="font-weight:600">${_fmtComp(c.total)}</td>
                <td><button class="btn btn-sm btn-soft" data-detail="${c.id}">Ver</button></td>
              </tr>`).join('')}
        </tbody>
      </table>
    </div>`;

  panel.querySelectorAll('[data-detail]').forEach(b =>
    b.addEventListener('click', () => _openCompDetail(b.dataset.detail)));
}

function _openCompDetail(id) {
  const compra = _compData.find(c => c.id == id);
  if (!compra) return;
  const m = Modal.create({
    title: `Compra #${compra.id}`,
    wide: true,
    content: `
      <div class="form-grid">
        <div class="form-grid form-grid-2">
          <div class="info-card"><p class="kpi-card__label">Proveedor</p><p style="font-weight:600">${compra.proveedor?.nombre || '—'}</p></div>
          <div class="info-card"><p class="kpi-card__label">Fecha</p><p>${compra.fecha}</p></div>
        </div>
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Producto</th><th>Cantidad</th><th>Costo Unit.</th><th>Subtotal</th></tr></thead>
            <tbody>
              ${compra.detalles?.map(d => `
                <tr>
                  <td>${d.producto?.nombre || '—'}</td>
                  <td>${d.cantidad}</td>
                  <td>${_fmtComp(d.costo_unitario)}</td>
                  <td>${_fmtComp(d.cantidad * d.costo_unitario)}</td>
                </tr>`).join('') || '<tr><td colspan="4" class="table__empty">Sin detalles</td></tr>'}
            </tbody>
          </table>
        </div>
        <div style="text-align:right;font-size:18px;font-weight:700">Total: ${_fmtComp(compra.total)}</div>
      </div>`,
  });
  m.open();
}

function _buildCompDetallesHTML() {
  if (_compDetalles.length === 0) {
    return `<p style="color:var(--text-muted);font-size:13px;text-align:center;padding:12px 0">Agrega al menos un producto</p>`;
  }
  return _compDetalles.map((d, i) => `
    <div class="detalle-item" data-idx="${i}">
      <select class="det-prod" style="flex:2">
        <option value="">Seleccionar producto…</option>
        ${_compProductos.map(p => `<option value="${p.id}" ${d.producto_id == p.id ? 'selected' : ''}>${p.nombre} (${p.codigo})</option>`).join('')}
      </select>
      <input class="det-cant" type="number" min="1" value="${d.cantidad}" placeholder="Cantidad" style="width:90px">
      <input class="det-costo" type="number" step="0.01" min="0.01" value="${d.costo_unitario}" placeholder="Costo unit." style="width:110px">
      <button class="btn btn-sm btn-danger det-remove">✕</button>
    </div>`).join('');
}

function _bindCompDetallesEvents(container) {
  container.querySelectorAll('.det-prod').forEach((sel, i) => {
    sel.addEventListener('change', () => { _compDetalles[i].producto_id = parseInt(sel.value); });
  });
  container.querySelectorAll('.det-cant').forEach((inp, i) => {
    inp.addEventListener('input', () => { _compDetalles[i].cantidad = parseInt(inp.value) || 1; });
  });
  container.querySelectorAll('.det-costo').forEach((inp, i) => {
    inp.addEventListener('input', () => { _compDetalles[i].costo_unitario = parseFloat(inp.value) || 0; });
  });
  container.querySelectorAll('.det-remove').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      _compDetalles.splice(i, 1);
      _refreshCompDetalles(container);
    });
  });
}

function _refreshCompDetalles(container) {
  container.innerHTML = _buildCompDetallesHTML();
  _bindCompDetallesEvents(container);
}

function _openCompForm() {
  _compDetalles = [];

  const provOpts = _compProveedores.map(p => `<option value="${p.id}">${p.nombre} — ${p.ciudad}</option>`).join('');

  const m = Modal.create({
    title: 'Nueva Compra',
    wide: true,
    content: `
      <div class="form-grid" id="comp-form">
        <div class="form-grid form-grid-2">
          <div class="field">
            <label>Proveedor</label>
            <select id="comp-prov" required>
              <option value="">Seleccionar…</option>
              ${provOpts}
            </select>
          </div>
          <div class="field">
            <label>Fecha y Hora</label>
            <input id="comp-fecha" type="datetime-local" value="${new Date().toISOString().slice(0,16)}" required>
          </div>
        </div>
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <label style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:var(--text-muted)">Productos</label>
            <button class="btn btn-sm btn-soft" id="comp-add-det">+ Agregar producto</button>
          </div>
          <div id="comp-detalles" class="detalle-list"></div>
        </div>
        <div class="modal__footer">
          <button type="button" class="btn btn-outline" id="comp-cancel">Cancelar</button>
          <button type="button" class="btn btn-primary" id="comp-submit">Registrar Compra</button>
        </div>
      </div>`,
  });
  m.open();

  const body = m.getBody();
  const detCont = body.querySelector('#comp-detalles');
  _refreshCompDetalles(detCont);

  body.querySelector('#comp-add-det').addEventListener('click', () => {
    _compDetalles.push({ producto_id: '', cantidad: 1, costo_unitario: 0 });
    _refreshCompDetalles(detCont);
  });

  body.querySelector('#comp-cancel').onclick = () => m.close();

  body.querySelector('#comp-submit').addEventListener('click', async () => {
    const btn = body.querySelector('#comp-submit');
    const provId = parseInt(body.querySelector('#comp-prov').value);
    const fechaRaw = body.querySelector('#comp-fecha').value;
    const fecha = fechaRaw.replace('T', ' ') + ':00';

    if (!provId) { toast.error('Selecciona un proveedor'); return; }
    if (_compDetalles.length === 0) { toast.error('Agrega al menos un producto'); return; }
    if (_compDetalles.some(d => !d.producto_id)) { toast.error('Todos los detalles deben tener un producto seleccionado'); return; }

    btn.disabled = true; btn.textContent = 'Guardando…';
    try {
      await compraApi.create({
        proveedor_id: provId,
        fecha,
        detalles: _compDetalles.map(d => ({
          producto_id: d.producto_id,
          cantidad: d.cantidad,
          costo_unitario: d.costo_unitario,
        })),
      });
      toast.ok('Compra registrada y stock actualizado');
      m.close();
      _compProductos = await productoApi.all().catch(() => _compProductos);
      await _loadCompras();
    } catch (err) {
      toast.error(err.message);
      btn.disabled = false; btn.textContent = 'Registrar Compra';
    }
  });
}
