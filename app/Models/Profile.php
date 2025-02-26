<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    use HasFactory;

    use HasFactory;

    protected $fillable = [
        'user_id',
        'first_name',
        'middle_name', // ✅ Make sure this is here
        'last_name',
        'suffix', // ✅ Make sure this is here
        'date_of_birth',
        'gender',
        'age',
        'profile_pic'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

