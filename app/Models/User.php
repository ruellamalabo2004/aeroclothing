<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens; // ✅ Add this

class User extends Authenticatable
{
    use HasApiTokens, Notifiable; // ✅ Use the trait here

    protected $fillable = [
        'email',
        'password',
        'role',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];
}
