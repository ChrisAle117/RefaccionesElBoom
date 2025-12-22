<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DhlPickup extends Model
{
    protected $table = 'dhl_pickups';

    protected $fillable = [
        'order_id',
        'dispatch_confirmation_number',
        'planned_pickup_at',
        'planned_pickup_tz',
        'close_time',
        'location',
        'location_type',
        'origin_postal_code',
        'origin_city_name',
        'origin_province_code',
        'origin_country_code',
        'origin_address_line1',
        'payload',
        'response',
    ];

    protected $casts = [
        'planned_pickup_at' => 'datetime',
        'payload'           => 'array',
        'response'          => 'array',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id', 'id_order');
    }
}
