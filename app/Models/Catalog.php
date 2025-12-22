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
}