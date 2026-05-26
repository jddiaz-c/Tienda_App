<?php
namespace App\Tienda\Controllers;

use Exception;
use App\Core\Validation\Validator;

abstract class BaseController {

    protected string $model = "";

    // reglas por entidad
    protected const RULES = [];

    function getAll() {
        return ($this->model)::all();
    }

    function getOne($id) {
        $row = ($this->model)::find($id);

        if (!$row) {
            $nombre = class_basename($this->model);
            throw new Exception("$nombre $id no existe", 1);
        }

        return $row;
    }

    function saveData($data) {

        Validator::validate($data, static::RULES);

        $model = new $this->model();
        $model->fill($data);
        $model->save();

        return $model;
    }

    function modify($id, $data) {

        Validator::validate($data, static::RULES, true);

        $model = $this->getOne($id);
        $model->fill($data);
        $model->save();

        return $model;
    }

    function remove($id) {
        $model = $this->getOne($id);
        $model->delete();
    }
}