<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    use HasFactory;

    // Define the table associated with the model (if it's not the plural form of the model name)
    protected $table = 'addresses';

    // Define which fields are mass assignable
    protected $fillable = [
        'user_id',
        'recipient_name',
        'phone_number',
        'country_id',
        'region',
        'city',
        'postal_code',
        'street_address',
        'is_default',
    ];

    // Define the relationship to the User model (each address belongs to a user)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Define the relationship to the Country model (each address belongs to a country)
    public function country()
    {
        return $this->belongsTo(Country::class);
    }
}
