<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model {  // Fixed: Class name should be singular
    use HasFactory;

    protected $fillable = [
        'shipping_id', 'product_id', 'customer',
        'payment_method', 'total_amount', 'date',
        'status', 'archive_at'
    ];
}