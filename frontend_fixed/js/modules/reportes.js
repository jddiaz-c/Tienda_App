/**
 * modules/reportes.js — global, no modules.
 */

const _fmtRep = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

async function mountReportes() {
  const el = document.getElementById('view-reportes');
  el.innerHTML = `<div class="loading-row"><div class="spinner"></div> Cargando reportes…</div>`;

  try {
    const [ingresos, gastos, stockBajo, top, unaCompra, frecuente] = await Promise.all([
      reporteApi.ingresos(),
      reporteApi.gastos(),
      reporteApi.stockBajo(),
      reporteApi.topCompradores(),
      reporteApi.unaCompra(),
      reporteApi.masFrecuente(),
    ]);

    const utilidad = (ingresos.total_ingresos || 0) - (gastos.total_gastos || 0);

    el.innerHTML = `
      <div>
        <div class="section-head" style="margin-bottom:14px">
          <div>
            <p class="section-head__eyebrow">Análisis</p>
            <h2 class="section-head__title">Reportes</h2>
          </div>
        </div>
        <div class="grid-3">
          <div class="kpi-card" style="background:#111;color:#f9fafb">
            <p class="kpi-card__label" style="color:rgba(255,255,255,.55)">Ingresos Totales</p>
            <p class="kpi-card__value">${_fmtRep(ingresos.total_ingresos || 0)}</p>
            <p class="kpi-card__hint" style="color:rgba(255,255,255,.6)">Por ventas a clientes</p>
          </div>
          <div class="kpi-card" style="background:#111;color:#f9fafb">
            <p class="kpi-card__label" style="color:rgba(255,255,255,.55)">Gastos Totales</p>
            <p class="kpi-card__value">${_fmtRep(gastos.total_gastos || 0)}</p>
            <p class="kpi-card__hint" style="color:rgba(255,255,255,.6)">Pagos a proveedores</p>
          </div>
          <div class="kpi-card" style="background:${utilidad >= 0 ? '#15803d' : '#b91c1c'};color:#f9fafb">
            <p class="kpi-card__label" style="color:rgba(255,255,255,.55)">Utilidad Neta</p>
            <p class="kpi-card__value">${_fmtRep(utilidad)}</p>
            <p class="kpi-card__hint" style="color:rgba(255,255,255,.6)">${utilidad >= 0 ? 'Balance positivo ✅' : 'Balance negativo ⚠️'}</p>
          </div>
        </div>
      </div>

      <div class="grid-2">
        <div class="panel">
          <div class="panel__header">
            <h3 class="panel__title">⚠️ Productos con Stock Bajo</h3>
            <span class="badge ${stockBajo.length > 0 ? 'badge-err' : 'badge-ok'}">${stockBajo.length}</span>
          </div>
          ${stockBajo.length === 0
            ? `<div class="info-card info-card--empty">✅ Todos los productos tienen stock suficiente</div>`
            : `<div class="table-wrap"><table class="table">
                <thead><tr><th>Código</th><th>Producto</th><th>Cat.</th><th>Actual</th><th>Mín</th></tr></thead>
                <tbody>
                  ${stockBajo.map(p => `
                    <tr>
                      <td><span class="mono">${p.codigo}</span></td>
                      <td>${p.nombre}</td>
                      <td style="text-transform:capitalize">${p.categoria?.nombre || '—'}</td>
                      <td class="${p.cantidad === 0 ? 'stock-crit' : 'stock-warn'}">${p.cantidad}</td>
                      <td>${p.stock_minimo}</td>
                    </tr>`).join('')}
                </tbody>
              </table></div>`}
        </div>

        <div class="panel">
          <div class="panel__header">
            <h3 class="panel__title">⭐ Cliente Más Frecuente</h3>
          </div>
          ${!frecuente
            ? `<div class="info-card info-card--empty">Sin datos de ventas aún</div>`
            : `<div class="info-card" style="display:grid;gap:10px">
                <div>
                  <p class="kpi-card__label">Nombre</p>
                  <p style="font-size:20px;font-weight:700;margin:4px 0">${frecuente.nombre} ${frecuente.apellido}</p>
                </div>
                <div class="grid-2" style="gap:10px">
                  <div><p class="kpi-card__label">Cédula</p><p class="mono">${frecuente.cedula}</p></div>
                  <div><p class="kpi-card__label">Compras</p><p style="font-weight:700;color:#15803d">${frecuente.ventas_count}</p></div>
                  <div><p class="kpi-card__label">Correo</p><p style="font-size:13px">${frecuente.correo}</p></div>
                  <div><p class="kpi-card__label">Teléfono</p><p>${frecuente.telefono}</p></div>
                </div>
              </div>`}
        </div>

        <div class="panel">
          <div class="panel__header">
            <h3 class="panel__title">🏆 Top Compradores</h3>
          </div>
          ${!top || top.length === 0
            ? `<div class="info-card info-card--empty">Sin datos aún</div>`
            : `<div class="table-wrap"><table class="table">
                <thead><tr><th>#</th><th>Cliente</th><th>Cédula</th><th>Compras</th><th>Total</th></tr></thead>
                <tbody>
                  ${top.map((c, i) => `
                    <tr>
                      <td><span class="badge ${i === 0 ? 'badge-ok' : i === 1 ? 'badge-warn' : 'badge-neutral'}">${i + 1}</span></td>
                      <td style="font-weight:500">${c.nombre} ${c.apellido}</td>
                      <td><span class="mono">${c.cedula}</span></td>
                      <td>${c.ventas_count}</td>
                      <td>${_fmtRep(c.ventas_sum_total || 0)}</td>
                    </tr>`).join('')}
                </tbody>
              </table></div>`}
        </div>

        <div class="panel">
          <div class="panel__header">
            <h3 class="panel__title">1️⃣ Compraron Solo Una Vez</h3>
            <span class="badge badge-neutral">${unaCompra?.length || 0}</span>
          </div>
          ${!unaCompra || unaCompra.length === 0
            ? `<div class="info-card info-card--empty">No hay clientes con solo una compra</div>`
            : `<div class="table-wrap"><table class="table">
                <thead><tr><th>Cliente</th><th>Cédula</th><th>Correo</th></tr></thead>
                <tbody>
                  ${unaCompra.map(c => `
                    <tr>
                      <td style="font-weight:500">${c.nombre} ${c.apellido}</td>
                      <td><span class="mono">${c.cedula}</span></td>
                      <td>${c.correo}</td>
                    </tr>`).join('')}
                </tbody>
              </table></div>`}
        </div>
      </div>

      <div class="panel">
        <div class="panel__header">
          <h3 class="panel__title">🧾 Resumen de Venta</h3>
        </div>
        <div style="display:flex;gap:10px;align-items:flex-end">
          <div class="field" style="flex:1;max-width:240px">
            <label>ID de la venta</label>
            <input id="resumen-id" type="number" min="1" placeholder="ej. 3">
          </div>
          <button class="btn btn-primary" id="btn-resumen">Ver Resumen</button>
        </div>
        <div id="resumen-result" style="margin-top:16px"></div>
      </div>`;

    document.getElementById('btn-resumen').addEventListener('click', _loadResumen);

  } catch (err) {
    toast.error('Error cargando reportes: ' + err.message);
    el.innerHTML = `<div class="empty-state"><div class="empty-state__icon">⚠️</div><p>No se pudieron cargar los reportes.</p></div>`;
  }
}

async function _loadResumen() {
  const id = document.getElementById('resumen-id').value;
  if (!id) { toast.error('Ingresa el ID de la venta'); return; }

  const result = document.getElementById('resumen-result');
  result.innerHTML = `<div class="loading-row"><div class="spinner"></div> Cargando…</div>`;

  try {
    const r = await reporteApi.resumenVenta(id);

    result.innerHTML = `
      <div class="info-card" style="display:grid;gap:14px">
        <div class="form-grid form-grid-2">
          <div><p class="kpi-card__label">Cliente</p><p style="font-weight:600">${r.cliente}</p></div>
          <div><p class="kpi-card__label">Cédula</p><p class="mono">${r.cedula}</p></div>
          <div><p class="kpi-card__label">Fecha</p><p>${r.fecha}</p></div>
          <div><p class="kpi-card__label">ID Venta</p><p>#${r.id}</p></div>
        </div>
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Producto</th><th>Categoría</th><th>Cant.</th><th>Precio Unit.</th><th>Impuesto</th><th>Val. Imp.</th><th>Total Línea</th></tr></thead>
            <tbody>
              ${r.detalles.map(d => `
                <tr>
                  <td>${d.producto}</td>
                  <td style="text-transform:capitalize">${d.categoria}</td>
                  <td>${d.cantidad}</td>
                  <td>${_fmtRep(d.precio_unitario)}</td>
                  <td>${d.impuesto_porcentaje}%</td>
                  <td>${_fmtRep(d.impuesto_valor)}</td>
                  <td style="font-weight:600">${_fmtRep(d.total_linea)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div style="display:grid;gap:6px;background:var(--bg-alt);border-radius:10px;padding:14px 16px;max-width:320px;margin-left:auto">
          <div style="display:flex;justify-content:space-between;font-size:13px"><span>Subtotal</span><span>${_fmtRep(r.subtotal)}</span></div>
          <div style="display:flex;justify-content:space-between;font-size:13px"><span>Impuesto</span><span>${_fmtRep(r.impuesto_total)}</span></div>
          <div style="display:flex;justify-content:space-between;font-size:17px;font-weight:700;border-top:1px solid var(--border);padding-top:8px;margin-top:4px"><span>Total</span><span>${_fmtRep(r.total)}</span></div>
        </div>
      </div>`;
  } catch (err) {
    result.innerHTML = `<div class="info-card info-card--empty">${err.message}</div>`;
  }
}
