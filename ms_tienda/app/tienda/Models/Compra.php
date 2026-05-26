<?php
namespace App\Tienda\Models;

use Illuminate\Database\Eloquent\Model;
use app\tienda\Models\Proveedor;
use app\tienda\Models\DetalleCompra;

class Compra extends Model {

    protected $table = 'compra';
    public $timestamps = false;

    protected $fillable = [
        'proveedor_id',
        'fecha',
        'total'
    ];

    public function proveedor() {
        return $this->belongsTo(Proveedor::class, 'proveedor_id');
    }

    public function detalles() {
        return $this->hasMany(DetalleCompra::class, 'compra_id');
    }
}