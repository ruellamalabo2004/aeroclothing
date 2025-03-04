<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category',
        'product_name',
        'product_type',
        'brand', // Added brand
        'sizes',
        'colors', // Added colors
        'price',
        'description',
        'image_1',
        'status',
    ];

    protected $casts = [
        'sizes' => 'array', // Automatically converts JSON to an array
        'colors' => 'array', // Automatically converts JSON to an array
    ];

    /**
     * Get the full image URL for image_1
     */
    public function getImage1Attribute($value)
    {
        return $value ? asset('storage/' . $value) : null;
    }

    /**
     * Scope to get only available products
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }
}
