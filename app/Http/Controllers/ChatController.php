<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    // 1. Start a new chat
    public function startChat(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            if (!$user->canLogin()) {
                return response()->json(['error' => 'Account is not active'], 403);
            }

            Log::info('Starting chat for user: ' . $user->id);

            // Check if the user already has an active chat
            $existingChat = Chat::where('user_id', $user->id)
                ->where('status', 'open')
                ->first();

            if ($existingChat) {
                Log::info('Found existing chat: ' . $existingChat->id);
                return response()->json(['chat' => ['id' => $existingChat->id]]);
            }

            // Create a new chat session
            $chat = Chat::create([
                'user_id' => $user->id,
                'status' => 'open',
            ]);

            Log::info('Created chat with ID: ' . $chat->id);

            // Send an initial system message
            $chat->messages()->create([
                'chat_id' => $chat->id,
                'user_id' => $user->id,
                'message' => 'You’re now in Live Chat. Waiting for an agent...',
                'is_agent' => true,
            ]);

            Log::info('Created initial message for chat ID: ' . $chat->id);

            return response()->json([
                'chat' => ['id' => $chat->id],
            ]);
        } catch (\Exception $e) {
            Log::error('Error starting chat: ' . $e->getMessage() . ' in ' . $e->getFile() . ' at line ' . $e->getLine());
            return response()->json(['error' => 'Server error occurred. Please try again later.'], 500);
        }
    }

    // 2. Send a message in a chat
    public function sendMessage(Request $request, Chat $chat)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            if (!$user->canLogin()) {
                return response()->json(['error' => 'Account is not active'], 403);
            }

            // Validate message input
            $request->validate([
                'message' => 'required|string|max:500',
            ]);

            // Ensure the user is either the chat owner or an admin
            if ($chat->user_id !== $user->id && !$user->is_admin) {
                return response()->json(['error' => 'Forbidden'], 403);
            }

            // Prevent sending messages to a closed chat
            if ($chat->status === 'closed') {
                return response()->json(['error' => 'This chat is closed'], 403);
            }

            // Create the message
            $message = $chat->messages()->create([
                'chat_id' => $chat->id,
                'user_id' => $user->id,
                'message' => $request->message,
                'is_agent' => $user->is_admin ?? false,
            ]);

            // Update the chat's updated_at timestamp
            $chat->touch();

            return response()->json(['message' => $message], 201);
        } catch (\Exception $e) {
            Log::error('Error sending message: ' . $e->getMessage() . ' in ' . $e->getFile() . ' at line ' . $e->getLine());
            return response()->json(['error' => 'Server error occurred. Please try again later.'], 500);
        }
    }

    // 3. Get all messages in a chat
    public function getMessages(Chat $chat)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            if (!$user->canLogin()) {
                return response()->json(['error' => 'Account is not active'], 403);
            }

            // Ensure the user is either the chat owner or an admin
            if ($chat->user_id !== $user->id && !$user->is_admin) {
                return response()->json(['error' => 'Forbidden'], 403);
            }

            // Fetch messages
            $messages = $chat->messages()->orderBy('created_at')->get()->map(function ($message) {
                return [
                    'message' => $message->message,
                    'is_agent' => $message->is_agent,
                    'timestamp' => $message->created_at,
                ];
            });

            return response()->json(['messages' => $messages]);
        } catch (\Exception $e) {
            Log::error('Error fetching messages: ' . $e->getMessage() . ' in ' . $e->getFile() . ' at line ' . $e->getLine());
            return response()->json(['error' => 'Server error occurred. Please try again later.'], 500);
        }
    }

    // 4. Get all chats (for the admin, including closed chats)
    public function getActiveChats(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            if (!$user->canLogin()) {
                return response()->json(['error' => 'Account is not active'], 403);
            }

            // Ensure the user is an admin
            if (!$user->is_admin) {
                return response()->json(['error' => 'Forbidden'], 403);
            }

            // Fetch all chats (both open and closed) with the last message
            $chats = Chat::with('user')
                ->with(['messages' => function ($query) {
                    $query->latest()->first();
                }])
                ->orderBy('updated_at', 'desc')
                ->get()
                ->map(function ($chat) {
                    return [
                        'chat_id' => $chat->id,
                        'user_id' => $chat->user_id,
                        'last_message' => $chat->messages->first()->message ?? 'No messages yet',
                        'timestamp' => $chat->updated_at,
                        'status' => $chat->status, // Include the status
                    ];
                });

            return response()->json(['chats' => $chats]);
        } catch (\Exception $e) {
            Log::error('Error fetching active chats: ' . $e->getMessage() . ' in ' . $e->getFile() . ' at line ' . $e->getLine());
            return response()->json(['error' => 'Server error occurred. Please try again later.'], 500);
        }
    }

    // 5. Archive a chat (to mark it as completed or inactive)
    public function archiveChat(Chat $chat)
    {
        try {
            $user = Auth::user();
            if (!$user || !$user->is_admin) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            if (!$user->canLogin()) {
                return response()->json(['error' => 'Account is not active'], 403);
            }

            // Archive the chat
            $chat->status = 'closed';
            $chat->save();

            return response()->json(['status' => 'Chat archived successfully']);
        } catch (\Exception $e) {
            Log::error('Error archiving chat: ' . $e->getMessage() . ' in ' . $e->getFile() . ' at line ' . $e->getLine());
            return response()->json(['error' => 'Server error occurred. Please try again later.'], 500);
        }
    }

    // 6. Revert an archived chat back to active (for re-engagement)
    public function revertChat(Chat $chat)
    {
        try {
            $user = Auth::user();
            if (!$user || !$user->is_admin) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            if (!$user->canLogin()) {
                return response()->json(['error' => 'Account is not active'], 403);
            }

            // Revert chat to active status
            $chat->status = 'open';
            $chat->save();

            return response()->json(['status' => 'Chat reverted to active']);
        } catch (\Exception $e) {
            Log::error('Error reverting chat: ' . $e->getMessage() . ' in ' . $e->getFile() . ' at line ' . $e->getLine());
            return response()->json(['error' => 'Server error occurred. Please try again later.'], 500);
        }
    }
}