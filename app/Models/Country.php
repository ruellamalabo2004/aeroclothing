<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
    use HasFactory;

    // Define the table associated with the model (optional if the table is named 'countries')
    protected $table = 'countries';

    // Define which fields are mass assignable
    protected $fillable = [
        'name', // assuming the name of the country is stored in the 'name' column
        'iso_code', // if you have an iso code field, e.g., 'US'
    ];

    // Define the relationship to the Address model (one country can have many addresses)
    public function addresses()
    {
        return $this->hasMany(Address::class);
    }
}
