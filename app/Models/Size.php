<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Size extends Model
{
    // Define the many-to-many relationship with products
    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_size');
    }
}
