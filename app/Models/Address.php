<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    protected $table = 'addresses';

    protected $primaryKey = 'id_direccion';

    protected $fillable = [
        'user_id',
        'calle',
        'colonia',
        'numero_exterior',  
        'numero_interior',
        'codigo_postal',
        'estado',
        'ciudad',
        'telefono',
        'referencia'
    ];
}
