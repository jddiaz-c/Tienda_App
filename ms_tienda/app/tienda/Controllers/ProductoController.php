<?php
namespace App\Tienda\Controllers;

use App\Tienda\Models\Producto;
use App\Tienda\Models\Categoria;
use Exception;

class ProductoController extends BaseController {

    protected string $model = Producto::class;

    protected const RULES = [
        'codigo' => [
            'required' => true,
            'type' => 'string',
            'min' => 1,
            'max' => 20,
            'regex' => '/^[A-Za-z0-9\-]+$/'
        ],
        'nombre' => [
            'required' => true,
            'type' => 'string',
            'min' => 3,
            'max' => 100,
            'regex' => '/^[a-zA-ZÁÉÍÓÚáéíóúñÑ0-9 ]+$/'
        ],
        'peso' => [
            'required' => true,
            'type' => 'decimal',
            'precision' => 10,
            'scale' => 2
        ],
        'cantidad' => [
            'required' => true,
            'type' => 'integer',
            'min' => 0
        ],
        'stock_minimo' => [
            'required' => true,
            'type' => 'integer',
            'min' => 5
        ],
        'tipo_empaque' => [
            'required' => true,
            'type' => 'string',
            'enum' => ['carton', 'plastico', 'otro']
        ],
        'precio' => [
            'required' => true,
            'type' => 'decimal',
            'precision' => 10,
            'scale' => 2
        ],
        'categoria_id' => [
            'required' => true,
            'type' => 'integer',
            'min' => 1
        ]
    ];

    protected function beforeCreate(array &$data) {

        $data['codigo'] = strtoupper(trim($data['codigo']));
        $data['nombre'] = trim($data['nombre']);

        if (Producto::where('codigo', $data['codigo'])->exists()) {
            throw new Exception("El código del producto ya está registrado.", 2);
        }

        $categoria = Categoria::find($data['categoria_id']);
        if (!$categoria) {
            throw new Exception("La categoría seleccionada no existe.", 2);
        }

        if ((float) $data['peso'] <= 0) {
            throw new Exception("El peso debe ser mayor que 0.", 2);
        }

        if ((float) $data['precio'] <= 0) {
            throw new Exception("El precio debe ser mayor que 0.", 2);
        }

        if ((int) $data['cantidad'] < 0) {
            throw new Exception("La cantidad no puede ser negativa.", 2);
        }

        if ((int) $data['stock_minimo'] < 5) {
            throw new Exception("El stock mínimo no puede ser menor que 5.", 2);
        }

        if (!in_array($data['tipo_empaque'], ['carton', 'plastico', 'otro'], true)) {
            throw new Exception("El tipo de empaque no es válido.", 2);
        }
    }

    protected function beforeUpdate(array &$data, $model) {

        if (isset($data['codigo'])) {
            $data['codigo'] = strtoupper(trim($data['codigo']));

            $existe = Producto::where('codigo', $data['codigo'])
                ->where('id', '!=', $model->id)
                ->exists();

            if ($existe) {
                throw new Exception("El código del producto ya está en uso.", 2);
            }
        }

        if (isset($data['nombre'])) {
            $data['nombre'] = trim($data['nombre']);
        }

        if (isset($data['categoria_id'])) {
            $categoria = Categoria::find($data['categoria_id']);
            if (!$categoria) {
                throw new Exception("La categoría seleccionada no existe.", 2);
            }
        }

        if (isset($data['peso']) && (float) $data['peso'] <= 0) {
            throw new Exception("El peso debe ser mayor que 0.", 2);
        }

        if (isset($data['precio']) && (float) $data['precio'] <= 0) {
            throw new Exception("El precio debe ser mayor que 0.", 2);
        }

        if (isset($data['cantidad']) && (int) $data['cantidad'] < 0) {
            throw new Exception("La cantidad no puede ser negativa.", 2);
        }

        if (isset($data['stock_minimo']) && (int) $data['stock_minimo'] < 5) {
            throw new Exception("El stock mínimo no puede ser menor que 5.", 2);
        }

        if (isset($data['tipo_empaque']) && !in_array($data['tipo_empaque'], ['carton', 'plastico', 'otro'], true)) {
            throw new Exception("El tipo de empaque no es válido.", 2);
        }
    }

    protected function beforeDelete($model) {

        if ($model->proveedores()->exists()) {
            throw new Exception("No se puede eliminar el producto porque tiene proveedores asociados.", 2);
        }

        if ($model->detallesCompra()->exists()) {
            throw new Exception("No se puede eliminar el producto porque tiene compras asociadas.", 2);
        }

        if ($model->detallesVenta()->exists()) {
            throw new Exception("No se puede eliminar el producto porque tiene ventas asociadas.", 2);
        }
    }
}