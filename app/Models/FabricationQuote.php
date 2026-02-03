<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FabricationQuote extends Model
{
    protected $fillable = [
        'nombre',
        'apellido',
        'telefono',
        'email',
        'estado',
        'servicio',
        'descripcion',
        'material',
        'espesor',
        'dimensiones',
        'angulo',
        'longitud',
        'cantidad_dobleces',
        'archivo_path',
        'status'
    ];
}
