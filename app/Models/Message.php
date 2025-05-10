<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Message extends Model
{
    use HasFactory, SoftDeletes;

    // Define the table name if it doesn't follow Laravel's plural naming convention
    protected $table = 'messages';

    // Set the fillable columns for mass assignment
    protected $fillable = [
        'chat_id',
        'user_id',
        'message',
        'image_path',
        'is_agent',
        'is_read',
        'archived_at',
    ];

    protected $casts = [
        'is_agent' => 'boolean',
        'is_read' => 'boolean',
        'archived_at' => 'datetime',
    ];

    // Define relationships
    public function chat()
    {
        return $this->belongsTo(Chat::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeFromAgent($query)
    {
        return $query->where('is_agent', true);
    }

    public function scopeFromUser($query)
    {
        return $query->where('is_agent', false);
    }
}
