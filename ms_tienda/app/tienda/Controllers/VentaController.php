<?php
namespace App\Tienda\Controllers;

use App\Tienda\Models\Venta;
use App\Tienda\Models\DetalleVenta;
use App\Tienda\Models\Cliente;
use App\Tienda\Models\Producto;
use App\Core\Validation\Validator;
use Exception;
use Illuminate\Database\Capsule\Manager as DB;

class VentaController extends BaseController
{

    protected string $model = Venta::class;

    protected const RULES = [
        'cliente_id' => [
            'required' => true,
            'type' => 'int',
            'min' => 1
        ],
        'fecha' => [
            'required' => true,
            'type' => 'datetime'
        ]
    ];

    public function getAll()
    {
        return Venta::with(['cliente', 'detalles.producto.categoria'])->get();
    }

    public function getOne($id)
    {
        $row = Venta::with(['cliente', 'detalles.producto.categoria'])->find($id);

        if (empty($row)) {
            throw new Exception("Venta $id no existe", 1);
        }

        return $row;
    }

    public function saveData($data)
    {
        Validator::validate($data, static::RULES);
        $this->beforeCreate($data);

        return DB::transaction(function () use ($data) {
            $subtotal = 0;
            $impuesto_total = 0;

            // Primera pasada: calcular totales
            $detallesCalculados = [];

            foreach ($data['detalles'] as $detalle) {
                $producto = Producto::with('categoria')->find($detalle['producto_id']);
                $cantidad = (int) $detalle['cantidad'];
                $precio = (float) $producto->precio;
                $impuesto = (float) $producto->categoria->impuesto;

                $subtotal_detalle = $cantidad * $precio;
                $impuesto_detalle = $subtotal_detalle * ($impuesto / 100);

                $subtotal += $subtotal_detalle;
                $impuesto_total += $impuesto_detalle;

                $detallesCalculados[] = [
                    'producto' => $producto,
                    'cantidad' => $cantidad,
                    'precio_unitario' => $precio,
                    'impuesto_porcentaje' => $impuesto
                ];
            }

            $total = $subtotal + $impuesto_total;

            // Guardar cabecera de venta
            $venta = new Venta();
            $venta->cliente_id = $data['cliente_id'];
            $venta->fecha = $data['fecha'];
            $venta->subtotal = round($subtotal, 2);
            $venta->impuesto_total = round($impuesto_total, 2);
            $venta->total = round($total, 2);
            $venta->save();

            // Segunda pasada: guardar detalles y descontar stock
            foreach ($detallesCalculados as $item) {
                $detalle = new DetalleVenta();
                $detalle->venta_id = $venta->id;
                $detalle->producto_id = $item['producto']->id;
                $detalle->cantidad = $item['cantidad'];
                $detalle->precio_unitario = $item['precio_unitario'];
                $detalle->impuesto_porcentaje = $item['impuesto_porcentaje'];
                $detalle->save();

                $item['producto']->cantidad -= $item['cantidad'];
                $item['producto']->save();
            }

            return $this->getOne($venta->id);
        });
    }

    protected function beforeCreate(array &$data)
    {
        if (!Cliente::find($data['cliente_id'])) {
            throw new Exception("El cliente no existe.", 2);
        }

        if (empty($data['detalles']) || !is_array($data['detalles'])) {
            throw new Exception("Debes enviar al menos un detalle de venta.", 2);
        }

        // Verificar productos duplicados
        $ids = array_column($data['detalles'], 'producto_id');
        if (count($ids) !== count(array_unique($ids))) {
            throw new Exception("No puedes incluir el mismo producto dos veces en una venta.", 2);
        }

        foreach ($data['detalles'] as $index => $detalle) {
            $n = $index + 1;

            if (empty($detalle['producto_id'])) {
                throw new Exception("El producto en el detalle $n es obligatorio.", 2);
            }

            $producto = Producto::find($detalle['producto_id']);
            if (!$producto) {
                throw new Exception("El producto en el detalle $n no existe.", 2);
            }

            if (empty($detalle['cantidad']) || (int) $detalle['cantidad'] <= 0) {
                throw new Exception("La cantidad en el detalle $n debe ser mayor que 0.", 2);
            }

            // Verificar stock suficiente
            if ((int) $detalle['cantidad'] > $producto->cantidad) {
                throw new Exception(
                    "Stock insuficiente para '$producto->nombre'. Disponible: $producto->cantidad, solicitado: $detalle[cantidad].",
                    2
                );
            }
        }
    }

    public function modify($id, $data)
    {
        throw new Exception("Modificar ventas no está permitido.", 2);
    }

    public function remove($id)
    {
        throw new Exception("Eliminar ventas no está permitido.", 2);
    }
}