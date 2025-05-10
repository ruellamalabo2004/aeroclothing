<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Chat extends Model
{
    use HasFactory, SoftDeletes;

    // Define the table name if it doesn't follow Laravel's plural naming convention
    protected $table = 'chats';

    // Set the fillable columns for mass assignment
    protected $fillable = [
        'user_id',
        'agent_id',
        'status',
        'archived_at',
    ];

    protected $casts = [
        'archived_at' => 'datetime',
    ];

    // Define relationships
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'asc');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'open');
    }

    public function scopeArchived($query)
    {
        return $query->where('status', 'closed');
    }

    // Accessors
    public function getUnreadCountAttribute()
    {
        return $this->messages()
            ->where('is_read', false)
            ->where('is_agent', false)
            ->count();
    }
}
