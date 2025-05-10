<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    // Store a new message in a chat
    public function store(Request $request)
    {
        $request->validate([
            'chat_id' => 'required|exists:chats,id',
            'message' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:2048', // Image validation
            'is_agent' => 'required|boolean',
        ]);

        // Handle image upload if present
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('chat_images', 'public');
        }

        // Create the new message
        $message = Message::create([
            'chat_id' => $request->chat_id,
            'user_id' => $request->is_agent ? null : auth()->id(),
            'message' => $request->message,
            'image_path' => $imagePath,
            'is_agent' => $request->is_agent,
        ]);

        return response()->json($message, 201);
    }

    // Get all messages for a chat
    public function index($chatId)
    {
        $messages = Message::where('chat_id', $chatId)->get();

        return response()->json($messages);
    }
}
