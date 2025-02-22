<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    use HasFactory;

    protected $table = 'profile';

    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'date_of_birth',
        'gender',
        'age',
        'profile_pic',
        'archive_at',
    ];

    protected $dates = ['date_of_birth', 'archive_at'];

    /**
     * Get the user that owns the profile.
    *public function user()
    *{
    *    return $this->belongsTo(User::class);
    *}
    */

    /**
     * Get the address associated with the profile.
     
    *public function address()
    *{
    *    return $this->belongsTo(Address::class);
    *}*/
}
