<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Inventory extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'inventory';

    protected $primaryKey = 'id';

    protected $fillable = [
        'product',
        'category',
        'type',
        'price',
        'sizes',
        'stock_quantity',
        'status'
    ];

    protected $dates = ['archived_at', 'created_at', 'updated_at'];
}