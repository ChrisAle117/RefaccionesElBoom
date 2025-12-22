<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    protected $table = 'cart_item'; 

    protected $fillable = ['shopping_cart_id', 'id_product', 'quantity']; 
    
    protected $primaryKey = 'id_cart_item';
    
    protected $casts = [
        'id_cart_item'     => 'integer',
        'shopping_cart_id' => 'integer',
        'id_product'       => 'integer',
        'quantity'         => 'integer',
    ];

    public function shoppingCart(): BelongsTo
    {
        return $this->belongsTo(ShoppingCart::class, 'shopping_cart_id', 'id_shopping_cart');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'id_product', 'id_product');
    }
}
