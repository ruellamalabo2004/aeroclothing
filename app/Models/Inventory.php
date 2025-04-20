<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Inventory extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'product_id',
        'stock_quantity',
        'status',
        'last_stock_update',
    ];

    protected static function booted()
    {
        static::creating(function ($inventory) {
            $inventory->status = self::determineStatus($inventory->stock_quantity);
            $inventory->last_stock_update = now();
        });

        static::updating(function ($inventory) {
            if ($inventory->isDirty('stock_quantity')) {
                $inventory->status = self::determineStatus($inventory->stock_quantity);
                $inventory->last_stock_update = now();
            }
        });
    }

    public static function determineStatus($quantity)
    {
        if ($quantity >= 10) {
            return 'In Stock';
        } elseif ($quantity > 0) {
            return 'Low Stock';
        } else {
            return 'Out of Stock';
        }
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
