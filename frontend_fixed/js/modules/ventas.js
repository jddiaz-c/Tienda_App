/**
 * modules/ventas.js — global, no modules.
 */

let _ventaData = [];
let _ventaClientes = [];
let _ventaProductos = [];
let _ventaDetalles = [];

const _fmtVenta = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

async function mountVentas() {
  [_ventaClientes, _ventaProductos] = await Promise.all([
    clienteApi.all().catch(() => []),
    productoApi.all().catch(() => []),
  ]);
  await _loadVentas();
}

async function _loadVentas() {
  const el = document.getElementById('view-ventas');
  el.innerHTML = `
    <div class="section-head">
      <div>
        <p class="section-head__eyebrow">Gestión</p>
        <h2 class="section-head__title">Ventas</h2>
      </div>
      <button class="btn btn-primary" id="btn-new-venta">+ Nueva Venta</button>
    </div>
    <div class="panel">
      <div class="loading-row"><div class="spinner"></div> Cargando…</div>
    </div>`;

  document.getElementById('btn-new-venta').addEventListener('click', _openVentaForm);

  try {
    _ventaData = await ventaApi.all();
    _renderVentaTable();
  } catch (err) {
    toast.error(err.message);
  }
}

function _renderVentaTable() {
  const panel = document.querySelector('#view-ventas .panel');
  panel.innerHTML = `
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr><th>ID</th><th>Fecha</th><th>Cliente</th><th>Subtotal</th><th>Impuesto</th><th>Total</th><th>Detalle</th></tr>
        </thead>
        <tbody>
          ${_ventaData.length === 0
            ? `<tr><td colspan="7" class="table__empty">No hay ventas registradas</td></tr>`
            : _ventaData.map(v => `
              <tr>
                <td>#${v.id}</td>
                <td>${v.fecha}</td>
                <td>${v.cliente?.nombre || '—'} ${v.cliente?.apellido || ''}</td>
                <td>${_fmtVenta(v.subtotal)}</td>
                <td>${_fmtVenta(v.impuesto_total)}</td>
                <td style="font-weight:700">${_fmtVenta(v.total)}</td>
                <td><button class="btn btn-sm btn-soft" data-detail="${v.id}">Ver</button></td>
              </tr>`).join('')}
        </tbody>
      </table>
    </div>`;

  panel.querySelectorAll('[data-detail]').forEach(b =>
    b.addEventListener('click', () => _openVentaDetail(b.dataset.detail)));
}

function _openVentaDetail(id) {
  const venta = _ventaData.find(v => v.id == id);
  if (!venta) return;
  const m = Modal.create({
    title: `Venta #${venta.id}`,
    wide: true,
    content: `
      <div class="form-grid">
        <div class="form-grid form-grid-2">
          <div class="info-card"><p class="kpi-card__label">Cliente</p><p style="font-weight:600">${venta.cliente?.nombre} ${venta.cliente?.apellido}</p></div>
          <div class="info-card"><p class="kpi-card__label">Fecha</p><p>${venta.fecha}</p></div>
        </div>
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Producto</th><th>Categoría</th><th>Cant.</th><th>Precio Unit.</th><th>Impuesto</th><th>Total línea</th></tr></thead>
            <tbody>
              ${venta.detalles?.map(d => `
                <tr>
                  <td>${d.producto?.nombre || '—'}</td>
                  <td style="text-transform:capitalize">${d.producto?.categoria?.nombre || '—'}</td>
                  <td>${d.cantidad}</td>
                  <td>${_fmtVenta(d.precio_unitario)}</td>
                  <td>${d.impuesto_porcentaje}%</td>
                  <td>${_fmtVenta(d.cantidad * d.precio_unitario * (1 + d.impuesto_porcentaje / 100))}</td>
                </tr>`).join('') || '<tr><td colspan="6" class="table__empty">Sin detalles</td></tr>'}
            </tbody>
          </table>
        </div>
        <div style="display:grid;gap:6px;background:var(--surface-alt);border:1px solid var(--border);border-radius:12px;padding:14px">
          <div style="display:flex;justify-content:space-between;font-size:13px"><span>Subtotal</span><span>${_fmtVenta(venta.subtotal)}</span></div>
          <div style="display:flex;justify-content:space-between;font-size:13px"><span>Impuesto</span><span>${_fmtVenta(venta.impuesto_total)}</span></div>
          <div style="display:flex;justify-content:space-between;font-size:17px;font-weight:700;border-top:1px solid var(--border);padding-top:8px;margin-top:4px"><span>Total</span><span>${_fmtVenta(venta.total)}</span></div>
        </div>
      </div>`,
  });
  m.open();
}

function _buildVentaDetallesHTML() {
  if (_ventaDetalles.length === 0) {
    return `<p style="color:var(--text-muted);font-size:13px;text-align:center;padding:12px 0">Agrega al menos un producto</p>`;
  }
  return _ventaDetalles.map((d, i) => {
    const prod = _ventaProductos.find(p => p.id == d.producto_id);
    const impuesto = prod?.categoria?.impuesto ?? 0;
    const subtotal = (d.cantidad || 0) * (prod?.precio || 0);
    const totalLinea = subtotal * (1 + impuesto / 100);
    return `
      <div class="detalle-item" data-idx="${i}" style="grid-template-columns:2fr 90px auto auto">
        <select class="det-prod">
          <option value="">Seleccionar producto…</option>
          ${_ventaProductos.map(p => `<option value="${p.id}" ${d.producto_id == p.id ? 'selected' : ''}>${p.nombre} — ${_fmtVenta(p.precio)} (stock: ${p.cantidad})</option>`).join('')}
        </select>
        <input class="det-cant" type="number" min="1" max="${prod?.cantidad || 9999}" value="${d.cantidad}" placeholder="Cant.">
        <div style="font-size:12px;color:var(--text-muted);min-width:90px;text-align:right">
          ${prod ? `<span>${impuesto}%</span><br><strong>${_fmtVenta(totalLinea)}</strong>` : ''}
        </div>
        <button class="btn btn-sm btn-danger det-remove">✕</button>
      </div>`;
  }).join('');
}

function _calcVentaTotal() {
  return _ventaDetalles.reduce((sum, d) => {
    const prod = _ventaProductos.find(p => p.id == d.producto_id);
    if (!prod) return sum;
    const imp = prod.categoria?.impuesto ?? 0;
    return sum + (d.cantidad || 0) * prod.precio * (1 + imp / 100);
  }, 0);
}

function _bindVentaDetallesEvents(container, totalEl) {
  container.querySelectorAll('.det-prod').forEach((sel, i) => {
    sel.addEventListener('change', () => {
      _ventaDetalles[i].producto_id = parseInt(sel.value) || null;
      _ventaDetalles[i].cantidad = 1;
      _refreshVentaDetalles(container, totalEl);
    });
  });
  container.querySelectorAll('.det-cant').forEach((inp, i) => {
    inp.addEventListener('input', () => {
      _ventaDetalles[i].cantidad = parseInt(inp.value) || 1;
      _refreshVentaDetalles(container, totalEl);
    });
  });
  container.querySelectorAll('.det-remove').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      _ventaDetalles.splice(i, 1);
      _refreshVentaDetalles(container, totalEl);
    });
  });
}

function _refreshVentaDetalles(container, totalEl) {
  container.innerHTML = _buildVentaDetallesHTML();
  _bindVentaDetallesEvents(container, totalEl);
  if (totalEl) totalEl.textContent = _fmtVenta(_calcVentaTotal());
}

function _openVentaForm() {
  _ventaDetalles = [];

  const cliOpts = _ventaClientes.map(c => `<option value="${c.id}">${c.nombre} ${c.apellido} — ${c.cedula}</option>`).join('');

  const m = Modal.create({
    title: 'Nueva Venta',
    wide: true,
    content: `
      <div class="form-grid" id="venta-form">
        <div class="form-grid form-grid-2">
          <div class="field">
            <label>Cliente</label>
            <select id="venta-cli" required>
              <option value="">Seleccionar…</option>
              ${cliOpts}
            </select>
          </div>
          <div class="field">
            <label>Fecha y Hora</label>
            <input id="venta-fecha" type="datetime-local" value="${new Date().toISOString().slice(0,16)}" required>
          </div>
        </div>
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <label style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:var(--text-muted)">Productos</label>
            <button class="btn btn-sm btn-soft" id="venta-add-det">+ Agregar</button>
          </div>
          <div id="venta-detalles" class="detalle-list"></div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;background:var(--surface-alt);border:1px solid var(--border);border-radius:12px;padding:12px 16px">
          <span style="font-size:13px;color:var(--text-muted)">Total estimado (con impuestos)</span>
          <strong id="venta-total" style="font-size:18px">$0</strong>
        </div>
        <div class="modal__footer">
          <button type="button" class="btn btn-outline" id="venta-cancel">Cancelar</button>
          <button type="button" class="btn btn-primary" id="venta-submit">Registrar Venta</button>
        </div>
      </div>`,
  });
  m.open();

  const body = m.getBody();
  const detCont = body.querySelector('#venta-detalles');
  const totalEl = body.querySelector('#venta-total');
  _refreshVentaDetalles(detCont, totalEl);

  body.querySelector('#venta-add-det').addEventListener('click', () => {
    _ventaDetalles.push({ producto_id: null, cantidad: 1 });
    _refreshVentaDetalles(detCont, totalEl);
  });

  body.querySelector('#venta-cancel').onclick = () => m.close();

  body.querySelector('#venta-submit').addEventListener('click', async () => {
    const btn = body.querySelector('#venta-submit');
    const cliId = parseInt(body.querySelector('#venta-cli').value);
    const fechaRaw = body.querySelector('#venta-fecha').value;
    const fecha = fechaRaw.replace('T', ' ') + ':00';

    if (!cliId) { toast.error('Selecciona un cliente'); return; }
    if (_ventaDetalles.length === 0) { toast.error('Agrega al menos un producto'); return; }
    if (_ventaDetalles.some(d => !d.producto_id)) { toast.error('Todos los detalles deben tener un producto'); return; }

    btn.disabled = true; btn.textContent = 'Guardando…';
    try {
      await ventaApi.create({
        cliente_id: cliId,
        fecha,
        detalles: _ventaDetalles.map(d => ({
          producto_id: d.producto_id,
          cantidad: d.cantidad,
        })),
      });
      toast.ok('Venta registrada y stock actualizado');
      m.close();
      _ventaProductos = await productoApi.all().catch(() => _ventaProductos);
      await _loadVentas();
    } catch (err) {
      toast.error(err.message);
      btn.disabled = false; btn.textContent = 'Registrar Venta';
    }
  });
}
