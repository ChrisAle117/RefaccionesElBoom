<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Models\PaymentProof;

class Order extends Model
{
    protected $primaryKey = 'id_order';
    
    protected $hidden = [
        'rfc',
        'tax_situation_document',
        'shipping_order_pdf',
        'dhl_label_path',
        'dhl_tracking_number',
        'shipping_email_sent_at',
        'dhl_label_created_at',
        'dhl_pickup_scheduled_at',
        'payment_method',
        'payment_date',
        'address_id',
        'user_id',
        'updated_at',
    ];

    protected $fillable = [
        'user_id',
        'address_id',
        'total_amount',
        'status',
        'expires_at',
        'payment_method',
        'shipping_order_pdf',
        'dhl_label_path',
        'dhl_tracking_number',
        'shipping_email_sent_at',
        'dhl_label_created_at',
        'dhl_pickup_scheduled_at',
        'requires_invoice',
        'rfc',
        'tax_situation_document',
    ];

    protected $casts = [
        'expires_at'              => 'datetime',
        'payment_date'            => 'datetime',
        'shipping_email_sent_at'  => 'datetime',
        'dhl_label_created_at'    => 'datetime',
        'dhl_pickup_scheduled_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function address(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'address_id', 'id_direccion');
    }
    
    public function payment_proofs()
    {
        return $this->hasMany(PaymentProof::class, 'order_id', 'id_order');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'order_id', 'id_order');
    }
    
    public function paymentProof(): HasOne
    {
        return $this->hasOne(PaymentProof::class, 'order_id', 'id_order');
    }

    public function isPending(): bool
    {
        return $this->status === 'pending_payment';
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'order_id', 'id_order');
    }
}