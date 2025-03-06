<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Inventory extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['product_id', 'stock_quantity', 'status'];

    public function product()
    {
        return $this->belongsTo(Product::class); // Ensure this is correct
    }

    protected static function booted()
    {
        static::saving(function ($inventory) {
            if ($inventory->stock_quantity <= 0) {
                $inventory->status = 'Out of Stock';
            } elseif ($inventory->stock_quantity <= 10) {
                $inventory->status = 'Low Stock';
            } else {
                $inventory->status = 'Available';
            }
        });
    }
}