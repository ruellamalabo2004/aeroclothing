<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReviewImage extends Model
{
    use HasFactory;

    // Allow mass assignment for these fields
    protected $fillable = [
        'review_id',
        'image_path',
    ];

    // Define the relationship with the Review model
    public function review()
    {
        return $this->belongsTo(Review::class);
    }
}
