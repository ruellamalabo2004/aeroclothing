<?php

// app/Http/Controllers/ChatController.php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function sendMessage(Request $request)
    {
        try {
            // Validate the incoming message
            $request->validate([
                'message' => 'required|string|max:500',
            ]);
    
            // Store the user's message in the database
            $userMessage = Message::create([
                'user_id' => auth()->id(),  // Assuming the user is authenticated
                'message' => $request->message,
                'is_agent' => false,  // User message
            ]);
    
            // Here you would send a response from the "agent" or bot
            $botResponse = Message::create([
                'user_id' => 1,  // Assuming agent ID is 1
                'message' => 'You said: ' . $request->message . '. How can I assist you further?',
                'is_agent' => true,  // Bot response
            ]);
    
            // Return the user and bot messages as JSON
            return response()->json([
                'user_message' => $userMessage,
                'agent_response' => $botResponse,
            ]);
        } catch (\Exception $e) {
            // Log the error for debugging
            \Log::error('Error in sendMessage: ' . $e->getMessage());
    
            return response()->json([
                'error' => 'Something went wrong: ' . $e->getMessage(),
            ], 500);
        }
    }
}    



