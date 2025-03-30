<?php

namespace App\Models;  // Correct namespace declaration

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',  // Use category_id instead of category
        'brand_id',     // Use brand_id instead of brand
        'product_name',
        'product_type',
        'sizes',
        'colors',
        'price',
        'description',
        'image_1',
        'status',
    ];

    protected $casts = [
        'sizes' => 'array',
        'colors' => 'array',
    ];

    public function orders() {
        return $this->belongsToMany(Order::class, 'order_details', 'product_id', 'order_id')
                    ->withPivot('quantity')
                    ->withTimestamps();
    }
    
    // Accessor to get the full image URL
    public function getImage1Attribute($value)
    {
        return $value ? asset('storage/' . $value) : null;
    }

    public function inventory()
    {
        return $this->hasOne(Inventory::class);
    }

    // Relationships
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class, 'brand_id');
    }

    // Scope for available products
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    // Scope for archived products
    public function scopeArchived($query)
    {
        return $query->where('status', 'archived');
    }
}
