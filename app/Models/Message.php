<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'message',
        'is_agent',
    ];

    // Define the relationship between messages and users
    public function user()
    {
        return $this->belongsTo(User::class); // Assuming each message is related to a user
    }
}
