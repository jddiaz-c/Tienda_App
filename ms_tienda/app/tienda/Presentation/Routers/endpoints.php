<?php

use Slim\App;
use App\Tienda\Presentation\Repositories\ClienteRepository;
use Slim\Routing\RouteCollectorProxy;

return function (App $app) {
    $app->group('/clientes', function (RouteCollectorProxy $group) {
        $group->get('', [ClienteRepository::class, 'all']);
        $group->get('/{id}', [ClienteRepository::class, 'detail']);
        $group->post('', [ClienteRepository::class, 'create']);
        $group->put('/{id}', [ClienteRepository::class, 'update']);
        $group->delete('/{id}', [CLienteRepository::class, 'delete']);
    });
};
