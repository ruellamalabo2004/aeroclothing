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
        'product_type_id',
        'image_1',
        'image_2',
        'status',
        'description',
        'price',
    ];

    protected $dates = ['created_at', 'updated_at', 'archived_at'];

    // Override the soft delete column name
    const DELETED_AT = 'archived_at';

    // Relationships
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function productType()
    {
        return $this->belongsTo(ProductType::class, 'product_type_id');
    }

    public function sizes()
    {
        return $this->belongsToMany(Size::class, 'product_size')
                    ->withTimestamps();
    }

    public function colors()
    {
        return $this->belongsToMany(Color::class, 'product_color')
                    ->withTimestamps();
    }
}