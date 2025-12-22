<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Order;

class PaymentProof extends Model
{
    protected $primaryKey = 'id_payment_proof';
    
    protected $fillable = [
        'order_id',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'notes',
        'status',
        'admin_notes'
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id', 'id_order');
    }
}