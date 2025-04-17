<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'category_id',
        'brand_id',
        'product_name',
        'product_type',
        'sizes',
        'colors', // Added to fillable
        'image_1',
        'image_2',
        'status',
        'description',
        'price',
    ];

    // Accessor to get sizes as an array
    public function getSizesAttribute($value)
    {
        return $value ? explode(',', $value) : [];
    }

    // Mutator to store sizes as a comma-separated string
    public function setSizesAttribute($value)
    {
        $this->attributes['sizes'] = is_array($value) ? implode(',', $value) : $value;
    }

    // Accessor to get colors as an array
    public function getColorsAttribute($value)
    {
        return $value ? explode(',', $value) : [];
    }

    // Mutator to store colors as a comma-separated string
    public function setColorsAttribute($value)
    {
        $this->attributes['colors'] = is_array($value) ? implode(',', $value) : $value;
    }

    // Define relationships with category and brand
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }
}