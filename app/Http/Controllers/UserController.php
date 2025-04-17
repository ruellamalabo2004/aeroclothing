<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class User extends Model
{
    use HasFactory, HasApiTokens;

    protected $fillable = [
        'first_name', 'middle_name', 'last_name', 'suffix', 'gender', 'birthdate', 'email', 'password',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];
}
