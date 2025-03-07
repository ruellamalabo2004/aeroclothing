<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Inventory extends Model
{
    use HasFactory, SoftDeletes; // Include SoftDeletes

    protected $fillable = ['product_id', 'stock_quantity', 'status'];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
