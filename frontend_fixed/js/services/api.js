/**
 * services/api.js
 * Central HTTP client — global, no modules.
 */

const CONFIG = {
  BASE_URL: 'http://localhost:8000'
};

async function _request(method, path, body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${CONFIG.BASE_URL}${path}`, opts);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { error: text }; }

  if (!res.ok) {
    const msg = data?.error || data?.message || `Error ${res.status}`;
    throw Object.assign(new Error(msg), { status: res.status, data });
  }
  return data;
}

const api = {
  get:    (path)       => _request('GET',    path),
  post:   (path, body) => _request('POST',   path, body),
  put:    (path, body) => _request('PUT',    path, body),
  delete: (path)       => _request('DELETE', path),
};

const categoriaApi = {
  all:    ()      => api.get('/categorias'),
  one:    (id)    => api.get(`/categorias/${id}`),
  create: (data)  => api.post('/categorias', data),
  update: (id, d) => api.put(`/categorias/${id}`, d),
  remove: (id)    => api.delete(`/categorias/${id}`),
};

const productoApi = {
  all:    ()      => api.get('/productos'),
  one:    (id)    => api.get(`/productos/${id}`),
  create: (data)  => api.post('/productos', data),
  update: (id, d) => api.put(`/productos/${id}`, d),
  remove: (id)    => api.delete(`/productos/${id}`),
};

const clienteApi = {
  all:    ()      => api.get('/clientes'),
  one:    (id)    => api.get(`/clientes/${id}`),
  create: (data)  => api.post('/clientes', data),
  update: (id, d) => api.put(`/clientes/${id}`, d),
  remove: (id)    => api.delete(`/clientes/${id}`),
};

const proveedorApi = {
  all:    ()      => api.get('/proveedores'),
  one:    (id)    => api.get(`/proveedores/${id}`),
  create: (data)  => api.post('/proveedores', data),
  update: (id, d) => api.put(`/proveedores/${id}`, d),
  remove: (id)    => api.delete(`/proveedores/${id}`),
};

const compraApi = {
  all:    ()     => api.get('/compras'),
  one:    (id)   => api.get(`/compras/${id}`),
  create: (data) => api.post('/compras', data),
};

const ventaApi = {
  all:    ()     => api.get('/ventas'),
  one:    (id)   => api.get(`/ventas/${id}`),
  create: (data) => api.post('/ventas', data),
};

const reporteApi = {
  ingresos:       () => api.get('/reportes/ingresos'),
  gastos:         () => api.get('/reportes/gastos'),
  stockBajo:      () => api.get('/reportes/stock-bajo'),
  topCompradores: () => api.get('/reportes/top-compradores'),
  unaCompra:      () => api.get('/reportes/una-compra'),
  masFrecuente:   () => api.get('/reportes/mas-frecuente'),
  resumenVenta:   (id) => api.get(`/reportes/ventas/${id}/resumen`),
};
