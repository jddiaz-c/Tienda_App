<?php
namespace App\Tienda\Models;

use Illuminate\Database\Eloquent\Model;
use App\tienda\Models\Producto;

class Categoria extends Model
{

    protected $table = 'categoria';
    public $timestamps = false;

    protected $fillable = ['nombre', 'impuesto'];

    public function productos()
    {
        return $this->hasMany(Producto::class, 'categoria_id');
    }
}