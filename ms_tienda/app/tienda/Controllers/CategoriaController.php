<?php
namespace App\Tienda\Controllers;

use App\Tienda\Models\Categoria;

class CategoriaController extends BaseController {

    protected string $model = Categoria::class;

    protected const RULES = [
        'nombre' => [
            'required' => true,
            'type' => 'string',
            'max' => 50
        ],
        'descripcion' => [
            'type' => 'string',
            'max' => 200
        ]
    ];
}