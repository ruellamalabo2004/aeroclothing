<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Review extends Model
{
    use HasFactory, SoftDeletes;

    // Allow mass assignment for these fields
    protected $fillable = [
        'user_id',
        'product_id',
        'order_id',
        'review',
        'rating',
        'reply',
    ];

    // Define the relationship with the ReviewImage model
    public function images()
    {
        return $this->hasMany(ReviewImage::class);
    }

    // Define the relationship with the User model
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Define the relationship with the Product model
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // Define the relationship with the Order model (optional, for verifying purchase)
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}

