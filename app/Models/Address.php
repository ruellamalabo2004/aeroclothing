<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    protected $fillable = [
        'user_id', 'recipient_name', 'phone_number', 'country',
        'region', 'city', 'postal_code', 'street_address', 'is_default'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
