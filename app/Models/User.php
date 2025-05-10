<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Notifications\ResetPasswordNotification;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable, HasFactory;

    protected $fillable = ['email', 'password', 'role_id', 'status'];

    protected $hidden = ['password', 'remember_token'];

    protected $dates = ['archived_at'];

    // Custom soft delete functionality using archived_at instead of deleted_at
    public function archive()
    {
        $this->status = 'Archived';
        $this->archived_at = now();
        $this->save();
    }

    public function restore()
    {
        $this->status = 'Active';
        $this->archived_at = null;
        $this->save();
    }

    // Scope to only get active users
    public function scopeActive($query)
    {
        return $query->where('status', 'Active');
    }

    // === RELATIONSHIPS ===

    public function profile()
    {
        return $this->hasOne(Profile::class, 'user_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'user_id');
    }

    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'user_id');
    }

    // === PASSWORD RESET ===

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    // === ACCESSORS / HELPERS ===

    public function getIsAdminAttribute()
    {
        return $this->role && $this->role->name === 'admin'; // assumes roles table has 'name' column
    }

    public function canLogin()
    {
        return $this->status === 'Active';
    }
}