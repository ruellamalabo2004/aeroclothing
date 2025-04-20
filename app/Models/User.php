<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Notifications\ResetPasswordNotification;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable, HasFactory;

    protected $fillable = ['email', 'password', 'role','status'];

    protected $hidden = ['password', 'remember_token'];

    public function profile()
    {
        return $this->hasOne(Profile::class, 'user_id');
    }

    public function messages()
{
    return $this->hasMany(Message::class, 'user_id');
}
public function sendPasswordResetNotification($token)
{
    $this->notify(new ResetPasswordNotification($token));
}

public function getIsAdminAttribute()
    {
        return $this->role === 'admin'; // Adjust based on your role column
    }

    public function canLogin()
    {
        return $this->status === 'Active';
    }

}