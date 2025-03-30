<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'profile_id',
        'payment_method',
        'total_amount',
        'order_date',
        'status',
        'archived_at',
    ];

    public function orderDetails()
    {
        return $this->hasMany(OrderDetail::class);
    }

    public function profile()
    {
        return $this->belongsTo(Profile::class);
    }

    public function trackings()
    {
        return $this->hasMany(OrderTracking::class);
    }
}