<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Catalog extends Model
{
    use HasFactory;
    
    protected $primaryKey = 'id_catalog';
    
    protected $fillable = [
        'title',
        'image',
        'alt',
        'url',
        'active',
        'order'
    ];
    
    protected $casts = [
        'active' => 'boolean',
    ];

    /**
     * Accesor para corregir la extensión de la imagen de fábrica si es necesario.
     */
    public function getImageAttribute($value)
    {
        if ($value && str_ends_with($value, 'fabrica.png')) {
            return str_replace('fabrica.png', 'fabrica.webp', $value);
        }
        return $value;
    }
}