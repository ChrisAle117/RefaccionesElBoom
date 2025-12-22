<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class ShoppingCart extends Model
{
    protected $table = 'shopping_carts'; 

    protected $primaryKey = 'id_shopping_cart'; 

    protected $fillable = ['user_id']; 

   
    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class, 'shopping_cart_id', 'id_shopping_cart');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function products()
    {
        return $this->belongsToMany(
            Product::class,
            'cart_item',                
            'shopping_cart_id',       
            'id_product'              
        )->withPivot('quantity');     
    }
}