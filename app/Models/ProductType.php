<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductType extends Model
{
    use HasFactory;

    // Define the table name (optional if table name matches the model's plural form)
    protected $table = 'product_types';

    // Define the fillable fields
    protected $fillable = [
        'type_name', // Adjust according to your column names
    ];

    // If you have other relationships or methods, add them here
}
