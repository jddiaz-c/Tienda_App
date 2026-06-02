/**
 * modules/dashboard.js — global, no modules.
 */

const _fmtDash = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

async function mountDashboard() {
  const el = document.getElementById('view-dashboard');
  el.innerHTML = `<div class="loading-row"><div class="spinner"></div> Cargando dashboard…</div>`;

  try {
    const [ingresos, gastos, stockBajo, top, frecuente, productos] = await Promise.all([
      reporteApi.ingresos(),
      reporteApi.gastos(),
      reporteApi.stockBajo(),
      reporteApi.topCompradores(),
      reporteApi.masFrecuente(),
      productoApi.all(),
    ]);

    const utilidad = (ingresos.total_ingresos || 0) - (gastos.total_gastos || 0);
    const stockBajoCount = Array.isArray(stockBajo) ? stockBajo.length : 0;

    el.innerHTML = `
      <div class="hero">
        <div class="hero__content">
          <div>
            <p class="hero__eyebrow">Panel General</p>
            <h1 class="hero__title">Resumen de la Tienda</h1>
            <p class="hero__subtitle">Gestiona categorías, productos, clientes, proveedores, compras y ventas desde un solo lugar.</p>
          </div>
          <div class="hero__actions">
            <button class="btn btn-primary" onclick="router.go('ventas')">+ Nueva Venta</button>
            <button class="btn btn-outline" onclick="router.go('compras')">+ Nueva Compra</button>
            <button class="btn btn-soft" onclick="router.go('reportes')">Ver Reportes</button>
          </div>
          <p class="hero__meta">
            <span>${productos.length}</span> productos registrados · 
            <span class="${stockBajoCount > 0 ? 'stock-crit' : 'stock-ok'}">${stockBajoCount} con stock bajo</span>
          </p>
        </div>
        <div class="hero__side">
          <div class="hero-card" style="width:100%">
            <p class="hero-card__label">Utilidad Neta</p>
            <p class="hero-card__value">${_fmtDash(utilidad)}</p>
            <p class="hero-card__hint">Ingresos − Gastos totales</p>
          </div>
        </div>
      </div>

      <div class="kpi-row">
        <div class="kpi-card">
          <p class="kpi-card__label">Ingresos Totales</p>
          <p class="kpi-card__value">${_fmtDash(ingresos.total_ingresos || 0)}</p>
          <p class="kpi-card__hint">Por ventas realizadas</p>
        </div>
        <div class="kpi-card">
          <p class="kpi-card__label">Gastos Totales</p>
          <p class="kpi-card__value">${_fmtDash(gastos.total_gastos || 0)}</p>
          <p class="kpi-card__hint">Pagos a proveedores</p>
        </div>
        <div class="kpi-card">
          <p class="kpi-card__label">Productos</p>
          <p class="kpi-card__value">${productos.length}</p>
          <p class="kpi-card__hint">${stockBajoCount} bajo stock mínimo</p>
        </div>
        <div class="kpi-card">
          <p class="kpi-card__label">Top Comprador</p>
          <p class="kpi-card__value kpi-card__value--small">${frecuente ? `${frecuente.nombre} ${frecuente.apellido}` : '—'}</p>
          <p class="kpi-card__hint">${frecuente ? `${frecuente.ventas_count} compras` : 'Sin datos'}</p>
        </div>
      </div>

      <div class="grid-2">
        <div class="panel">
          <div class="panel__header">
            <h3 class="panel__title">⚠️ Stock Bajo</h3>
            <button class="btn btn-sm btn-soft" onclick="router.go('reportes')">Ver todo</button>
          </div>
          <div class="table-wrap">
            <table class="table">
              <thead><tr><th>Producto</th><th>Categoría</th><th>Stock</th><th>Mínimo</th></tr></thead>
              <tbody>
                ${stockBajoCount === 0
                  ? `<tr><td colspan="4" class="table__empty">✅ Todos los productos tienen stock suficiente</td></tr>`
                  : stockBajo.slice(0,6).map(p => `
                    <tr>
                      <td><span class="mono">${p.codigo}</span> ${p.nombre}</td>
                      <td>${p.categoria?.nombre || '—'}</td>
                      <td class="stock-crit">${p.cantidad}</td>
                      <td>${p.stock_minimo}</td>
                    </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="panel">
          <div class="panel__header">
            <h3 class="panel__title">🏆 Top Compradores</h3>
          </div>
          <div class="table-wrap">
            <table class="table">
              <thead><tr><th>#</th><th>Cliente</th><th>Compras</th><th>Total</th></tr></thead>
              <tbody>
                ${!top || top.length === 0
                  ? `<tr><td colspan="4" class="table__empty">Sin datos aún</td></tr>`
                  : top.slice(0,6).map((c, i) => `
                    <tr>
                      <td><span class="badge badge-neutral">${i + 1}</span></td>
                      <td>${c.nombre} ${c.apellido}</td>
                      <td>${c.ventas_count}</td>
                      <td>${_fmtDash(c.ventas_sum_total || 0)}</td>
                    </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

  } catch (err) {
    toast.error('Error cargando dashboard: ' + err.message);
    el.innerHTML = `<div class="empty-state"><div class="empty-state__icon">⚠️</div><p class="empty-state__text">No se pudo cargar el dashboard. Verifica que la API esté activa.</p></div>`;
  }
}
