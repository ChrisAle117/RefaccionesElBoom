<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $primaryKey = 'id_payments';
    
    protected $fillable = [
        'order_id',
        'amount',
        'transaction_id',
        'payment_method',
        'status'
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id', 'id_order');
    }
    
    /**
     * Mapea los estados de la orden a los estados de pago correspondientes
     * 
     * @param string $orderStatus Estado de la orden
     * @return string Estado de pago correspondiente
     */
    public static function mapOrderStatusToPaymentStatus(string $orderStatus): string
    {
        $statusMap = [
            'pending_payment' => 'pending',
            'payment_uploaded' => 'pending',
            'payment_verified' => 'payment_verified',
            'processing' => 'payment_verified',
            'shipped' => 'payment_verified',
            'delivered' => 'payment_verified',
            'cancelled' => 'cancelled',
            'rejected' => 'rejected'
        ];
        
        return $statusMap[$orderStatus] ?? $orderStatus;
    }
}