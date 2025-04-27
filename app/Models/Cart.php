<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;

    // Set the table name explicitly if it is not the default plural form
    protected $table = 'cart'; // or use 'carts' if that's your actual table name

    protected $fillable = ['user_id', 'product_id', 'quantity', 'color', 'size'];

    // Relationship with the User model
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relationship with the Product model
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
