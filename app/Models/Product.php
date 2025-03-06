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
        'brand',
        'sizes',
        'colors',
        'price',
        'quantity', 
        'description',
        'image_1',
        'status',
    ];

    protected $casts = [
        'sizes' => 'array',
        'colors' => 'array',
    ];

    public function getImage1Attribute($value)
    {
        return $value ? asset('storage/' . $value) : null;
    }

    
    public function setQuantityAttribute($value)
    {
        $this->attributes['quantity'] = $value;
        // Automatically update status based on quantity
        $this->attributes['status'] = $this->determineStatus($value);
    }

  
    protected function determineStatus($quantity)
    {
        if ($quantity <= 0) {
            return 'out_of_stock';
        }
      
        return $this->attributes['status'] === 'archived' ? 'archived' : 'available';
    }

   
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

   
    public function scopeOutOfStock($query)
    {
        return $query->where('status', 'out_of_stock');
    }

    public function scopeArchived($query)
    {
        return $query->where('status', 'archived');
    }
}