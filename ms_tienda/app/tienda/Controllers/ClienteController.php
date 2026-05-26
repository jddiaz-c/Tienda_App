<?php
namespace App\Tienda\Controllers;

use App\Tienda\Models\Cliente;
use Exception;

class ClienteController extends BaseController
{
    protected const CAMPOS_OBLIGATORIOS = ['cedula', 'nombre', 'apellido', 'telefono', 'correo'];
    protected const LONGITUDES_MAXIMAS = [
    'cedula'   => 20,
    'nombre'   => 50,
    'apellido' => 50,
    'telefono' => 20,
    'correo'   => 100,
];
    protected string $model = Cliente::class;
    protected function checkData($data, $excludeId = null)
    {
        parent::checkData($data);

        // Validar formato de correo
        if (!filter_var($data['correo'], FILTER_VALIDATE_EMAIL)) {
            throw new Exception("El correo '$data[correo]' no tiene un formato válido.", 3);
        }

        // Validar formato de teléfono
        if (!preg_match('/^[+0-9\s\-]{7,20}$/', $data['telefono'])) {
            throw new Exception("El teléfono '$data[telefono]' no tiene un formato válido.", 3);
        }

        // Validar cédula única
        $query = Cliente::where('cedula', $data['cedula']);
        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId);
        }
        if ($query->exists()) {
            throw new Exception("Ya existe un cliente con la cédula '$data[cedula]'.", 2);
        }
    }
    function modify($id, $data)
    {
        $this->checkData($data, $id);
        $model = $this->getOne($id);
        $model->fill($data);
        $model->save();
        return $model;
    }
}