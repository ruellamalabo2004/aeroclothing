<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Courier extends Model
{
    protected $table = 'couriers';

    protected $fillable = [
        'name',
        'shipping_fee',
        'estimated_delivery_time',
        'is_active',
    ];

    protected $casts = [
        'shipping_fee' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    // Relationship: A courier has many orders
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
