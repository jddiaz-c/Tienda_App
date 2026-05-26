<?php

use Slim\App;
use Slim\Routing\RouteCollectorProxy;
use App\Tienda\Presentation\Repositories\CategoriaRepository;
use App\Tienda\Presentation\Repositories\ProductoRepository;
use App\Tienda\Presentation\Repositories\ClienteRepository;
use App\Tienda\Presentation\Repositories\ProveedorRepository;
use App\Tienda\Presentation\Repositories\CompraRepository;
use App\Tienda\Presentation\Repositories\VentaRepository;
use App\Tienda\Presentation\Repositories\ReporteRepository;

return function (App $app) {

    $app->group('/categorias', function (RouteCollectorProxy $group) {
        $group->get('', [CategoriaRepository::class, 'all']);
        $group->get('/{id}', [CategoriaRepository::class, 'detail']);
        $group->post('', [CategoriaRepository::class, 'create']);
        $group->put('/{id}', [CategoriaRepository::class, 'update']);
        $group->delete('/{id}', [CategoriaRepository::class, 'delete']);
    });

    $app->group('/productos', function (RouteCollectorProxy $group) {
        $group->get('', [ProductoRepository::class, 'all']);
        $group->get('/{id}', [ProductoRepository::class, 'detail']);
        $group->post('', [ProductoRepository::class, 'create']);
        $group->put('/{id}', [ProductoRepository::class, 'update']);
        $group->delete('/{id}', [ProductoRepository::class, 'delete']);
    });

    $app->group('/clientes', function (RouteCollectorProxy $group) {
        $group->get('', [ClienteRepository::class, 'all']);
        $group->get('/{id}', [ClienteRepository::class, 'detail']);
        $group->post('', [ClienteRepository::class, 'create']);
        $group->put('/{id}', [ClienteRepository::class, 'update']);
        $group->delete('/{id}', [ClienteRepository::class, 'delete']);
    });

    $app->group('/proveedores', function (RouteCollectorProxy $group) {
        $group->get('', [ProveedorRepository::class, 'all']);
        $group->get('/{id}', [ProveedorRepository::class, 'detail']);
        $group->post('', [ProveedorRepository::class, 'create']);
        $group->put('/{id}', [ProveedorRepository::class, 'update']);
        $group->delete('/{id}', [ProveedorRepository::class, 'delete']);
    });

    $app->group('/compras', function (RouteCollectorProxy $group) {
        $group->get('', [CompraRepository::class, 'all']);
        $group->get('/{id}', [CompraRepository::class, 'detail']);
        $group->post('', [CompraRepository::class, 'create']);
    });

    $app->group('/ventas', function (RouteCollectorProxy $group) {
        $group->get('', [VentaRepository::class, 'all']);
        $group->get('/{id}', [VentaRepository::class, 'detail']);
        $group->post('', [VentaRepository::class, 'create']);
    });
    $app->group('/reportes', function (RouteCollectorProxy $group) {
        $group->get('/ingresos', [ReporteRepository::class, 'ingresos']);
        $group->get('/gastos', [ReporteRepository::class, 'gastos']);
        $group->get('/stock-bajo', [ReporteRepository::class, 'stockBajo']);
        $group->get('/top-compradores', [ReporteRepository::class, 'topCompradores']);
        $group->get('/una-compra', [ReporteRepository::class, 'unaCompra']);
        $group->get('/mas-frecuente', [ReporteRepository::class, 'masFrecuente']);
        $group->get('/ventas/{id}/resumen', [ReporteRepository::class, 'resumenVenta']);
    });
};