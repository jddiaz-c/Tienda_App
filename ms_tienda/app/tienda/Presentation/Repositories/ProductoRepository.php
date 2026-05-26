<?php

namespace App\Tienda\Presentation\Repositories;

use App\Tienda\Controllers\ProductoController;

class ProductoRepository extends BaseRepository
{
    protected function getController()
    {
        return new ProductoController();
    }
}