<?php
namespace App\Tienda\Models;

use Illuminate\Database\Eloquent\Model;
use app\tienda\Models\Compra;
use app\tienda\Models\Producto;

class DetalleCompra extends Model {

    protected $table = 'detalle_compra';
    public $timestamps = false;

    protected $fillable = [
        'compra_id',
        'producto_id',
        'cantidad',
        'costo_unitario'
    ];

    public function compra() {
        return $this->belongsTo(Compra::class, 'compra_id');
    }

    public function producto() {
        return $this->belongsTo(Producto::class, 'producto_id');
    }
}