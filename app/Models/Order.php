<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'profile_id',
        'shipping_method_id',
        'payment_method_id',
        'total_amount',
        'order_date',
        'status',
    ];

    public function profile()
    {
        return $this->belongsTo(Profile::class);
    }

    public function shippingMethod()
    {
        return $this->belongsTo(ShippingMethod::class);
    }

    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    public function orderDetails()
    {
        return $this->hasMany(OrderDetail::class);
    }
}
