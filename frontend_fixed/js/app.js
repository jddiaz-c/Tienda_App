/**
 * app.js — Entry point. No modules, plain scripts.
 */

// Wire nav buttons to router
document.querySelectorAll('.nav-link[data-nav]').forEach(btn => {
  btn.addEventListener('click', () => router.go(btn.dataset.nav));
});

// Register routes
router.on('dashboard',   mountDashboard);
router.on('categorias',  mountCategorias);
router.on('productos',   mountProductos);
router.on('clientes',    mountClientes);
router.on('proveedores', mountProveedores);
router.on('compras',     mountCompras);
router.on('ventas',      mountVentas);
router.on('reportes',    mountReportes);

// Boot
router.init();

// Error global no capturado
window.addEventListener('unhandledrejection', e => {
    toast.error('Error inesperado: ' + (e.reason?.message || 'intenta de nuevo'));
});