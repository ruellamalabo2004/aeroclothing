<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    protected $fillable = [
        'user_id', 
        'first_name', 
        'middle_name', 
        'last_name', 
        'suffix',
        'phone_number', // Changed from 'phone'
        'gender', 
        'date_of_birth', 
        'profile_pic'   // Changed from 'profile_image'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}