<?php
namespace App\Tienda\Controllers;

use App\Tienda\Models\Compra;
use App\Tienda\Models\DetalleCompra;
use App\Tienda\Models\Proveedor;
use App\Tienda\Models\Producto;
use Exception;
use Illuminate\Database\Capsule\Manager as DB;

class CompraController extends BaseController {

    protected string $model = Compra::class;

    protected const RULES = [
        'proveedor_id' => [
            'required' => true,
            'type' => 'integer',
            'min' => 1
        ],
        'fecha' => [
            'required' => true,
            'type' => 'datetime'
        ],
        'detalles' => [
            'required' => true,
            'type' => 'array',
            'min_items' => 1
        ]
    ];

    public function getAll() {
        return Compra::with(['proveedor', 'detalles.producto'])->get();
    }

    public function getOne($id) {
        $row = Compra::with(['proveedor', 'detalles.producto'])->find($id);

        if (empty($row)) {
            throw new Exception("Compra $id no existe", 1);
        }

        return $row;
    }

    public function saveData($data) {
        $this->validarCompra($data);

        return DB::transaction(function () use ($data) {

            $proveedor = Proveedor::find($data['proveedor_id']);
            if (!$proveedor) {
                throw new Exception("El proveedor no existe.", 2);
            }

            $total = 0;

            foreach ($data['detalles'] as $detalle) {
                $producto = Producto::find($detalle['producto_id']);

                if (!$producto) {
                    throw new Exception("Uno de los productos no existe.", 2);
                }

                $cantidad = (int) $detalle['cantidad'];
                $costo = (float) $detalle['costo_unitario'];

                if ($cantidad <= 0) {
                    throw new Exception("La cantidad del detalle debe ser mayor que 0.", 2);
                }

                if ($costo <= 0) {
                    throw new Exception("El costo unitario debe ser mayor que 0.", 2);
                }

                $total += $cantidad * $costo;
            }

            $compra = new Compra();
            $compra->proveedor_id = $data['proveedor_id'];
            $compra->fecha = $data['fecha'];
            $compra->total = $total;
            $compra->save();

            foreach ($data['detalles'] as $detalle) {
                $producto = Producto::find($detalle['producto_id']);
                $cantidad = (int) $detalle['cantidad'];
                $costo = (float) $detalle['costo_unitario'];

                $detalleCompra = new DetalleCompra();
                $detalleCompra->compra_id = $compra->id;
                $detalleCompra->producto_id = $producto->id;
                $detalleCompra->cantidad = $cantidad;
                $detalleCompra->costo_unitario = $costo;
                $detalleCompra->save();

                $producto->cantidad = (int) $producto->cantidad + $cantidad;
                $producto->save();
            }

            return Compra::with(['proveedor', 'detalles.producto'])->find($compra->id);
        });
    }

    public function modify($id, $data) {
        throw new Exception("Modificar compras no está permitido porque afectaría el inventario. Elimina y registra una nueva compra.", 2);
    }

    public function remove($id) {
        throw new Exception("Eliminar compras no está permitido porque afectaría el inventario histórico.", 2);
    }

    protected function validarCompra(array $data) {

        if (!isset($data['proveedor_id']) || (int)$data['proveedor_id'] <= 0) {
            throw new Exception("El proveedor es obligatorio.", 2);
        }

        if (empty($data['fecha'])) {
            throw new Exception("La fecha es obligatoria.", 2);
        }

        if (empty($data['detalles']) || !is_array($data['detalles'])) {
            throw new Exception("Debes enviar al menos un detalle de compra.", 2);
        }

        foreach ($data['detalles'] as $index => $detalle) {

            if (!isset($detalle['producto_id']) || (int)$detalle['producto_id'] <= 0) {
                throw new Exception("El producto en el detalle " . ($index + 1) . " es obligatorio.", 2);
            }

            if (!isset($detalle['cantidad']) || (int)$detalle['cantidad'] <= 0) {
                throw new Exception("La cantidad en el detalle " . ($index + 1) . " debe ser mayor que 0.", 2);
            }

            if (!isset($detalle['costo_unitario']) || (float)$detalle['costo_unitario'] <= 0) {
                throw new Exception("El costo unitario en el detalle " . ($index + 1) . " debe ser mayor que 0.", 2);
            }
        }
    }
}