<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class ChatController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    // Start a new chat
    public function startChat(Request $request)
    {
        try {
            // Get the authenticated user
            $user = Auth::user();

            // Check if user already has an active chat
            $existingChat = Chat::where('user_id', $user->id)
                ->where('status', 'open')
                ->first();

            if ($existingChat) {
                return response()->json($existingChat, 200);
            }

            // Create new chat
            $chat = Chat::create([
                'user_id' => $user->id,
                'status' => 'open',
                'agent_id' => null,
            ]);

            // Load the user relationship
            $chat->load('user');

            return response()->json($chat, 201);
        } catch (\Exception $e) {
            Log::error('Error starting chat: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to start chat'], 500);
        }
    }

    // Get active chats
    public function getActiveChats()
    {
        try {
            $user = Auth::user();
            
            // If user is admin, get all chats (both open and closed)
            if ($user->isAdmin) {
                $chats = Chat::with([
                    'user.profile',
                    'agent.profile',
                    'messages' => function($query) {
                        $query->latest()->take(1);
                    }
                ])
                ->latest()
                ->get();
            } else {
                // If user is customer, get only their chats
                $chats = Chat::with([
                    'user.profile',
                    'agent.profile',
                    'messages' => function($query) {
                        $query->latest()->take(1);
                    }
                ])
                ->where('user_id', $user->id)
                ->latest()
                ->get();
            }

            return response()->json($chats);
        } catch (\Exception $e) {
            Log::error('Error fetching chats: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch chats'], 500);
        }
    }

    // Get messages for a specific chat
    public function getMessages($chatId)
    {
        try {
            $user = Auth::user();
            $chat = Chat::with(['user.profile'])->findOrFail($chatId);
            
            // Check if user has permission to view this chat
            if (!$user->isAdmin && $user->id !== $chat->user_id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $messages = Message::where('chat_id', $chatId)
                ->with(['user.profile'])
                ->orderBy('created_at', 'asc')
                ->get();

            // If user is admin, mark unread messages as read
            if ($user->isAdmin) {
                Message::where('chat_id', $chatId)
                    ->where('is_read', false)
                    ->where('is_agent', false)
                    ->update(['is_read' => true]);
            }

            return response()->json($messages);
        } catch (\Exception $e) {
            Log::error('Error fetching messages: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch messages'], 500);
        }
    }

    // Send a message in a chat
    public function sendMessage(Request $request, $chatId)
    {
        try {
            $user = Auth::user();
            $validator = Validator::make($request->all(), [
                'message' => 'nullable|string|max:1000',
                'image' => 'nullable|image|mimes:jpeg,png,gif|max:2048',
                'is_agent' => 'required|in:true,false,0,1',
            ], [
                'message.max' => 'Message cannot be longer than 1000 characters',
                'image.image' => 'The file must be an image',
                'image.mimes' => 'The image must be a jpg, jpeg, png, or gif',
                'image.max' => 'The image cannot be larger than 2MB',
                'is_agent.required' => 'Message type (is_agent) is required',
                'is_agent.in' => 'Invalid message type',
            ]);

            if ($validator->fails()) {
                Log::error('Validation failed:', ['errors' => $validator->errors()->toArray()]);
                return response()->json([
                    'message' => 'The given data was invalid.',
                    'errors' => $validator->errors()
                ], 422);
            }

            $chat = Chat::findOrFail($chatId);
            
            // Check if chat is closed
            if ($chat->status === 'closed') {
                return response()->json([
                    'message' => 'This chat is closed. You cannot send messages.',
                    'status' => 'closed'
                ], 403);
            }
            
            // Check if user has permission to send messages in this chat
            if (!$user->isAdmin && $user->id !== $chat->user_id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            // If user is admin, set them as the agent for this chat
            if ($user->isAdmin && !$chat->agent_id) {
                $chat->update(['agent_id' => $user->id]);
            }

            // Convert is_agent to boolean and ensure it matches user role
            $isAgent = $user->isAdmin ? true : filter_var($request->is_agent, FILTER_VALIDATE_BOOLEAN);

            // Handle image upload if present
            $imagePath = null;
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                
                if (!$image->isValid()) {
                    throw new \Exception('Invalid image file');
                }

                $imagePath = $image->store('chat_images', 'public');
                
                if (!Storage::disk('public')->exists($imagePath)) {
                    throw new \Exception('Failed to store image');
                }

                Log::info('Image uploaded successfully:', [
                    'path' => $imagePath,
                    'size' => $image->getSize(),
                    'mime' => $image->getMimeType()
                ]);
            }

            // Create the message
            $message = Message::create([
                'chat_id' => $chatId,
                'user_id' => $user->id,
                'message' => $request->message,
                'image_path' => $imagePath,
                'is_agent' => $isAgent,
                'is_read' => false,
            ]);

            // Load the user relationship with profile
            $message->load(['user.profile']);

            return response()->json($message, 201);
        } catch (\Exception $e) {
            Log::error('Error sending message: ' . $e->getMessage());
            Log::error('Request data: ' . json_encode($request->all()));
            return response()->json([
                'message' => 'Failed to send message',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Archive a chat
    public function archiveChat($chatId)
    {
        try {
            $user = Auth::user();
            $chat = Chat::findOrFail($chatId);
            
            // Check if user has permission to archive this chat
            if (!$user->isAdmin && $user->id !== $chat->user_id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $chat->status = 'closed';
            $chat->archived_at = now();
            $chat->save();

            return response()->json([
                'message' => 'Chat closed successfully',
                'chat' => $chat
            ]);
        } catch (\Exception $e) {
            Log::error('Error archiving chat: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to archive chat'], 500);
        }
    }

    // Revert an archived chat
    public function revertChat($chatId)
    {
        try {
            $user = Auth::user();
            $chat = Chat::findOrFail($chatId);
            
            // Only admin can revert archived chats
            if (!$user->isAdmin) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $chat->status = 'open';
            $chat->archived_at = null;
            $chat->save();

            return response()->json($chat);
        } catch (\Exception $e) {
            Log::error('Error reverting chat: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to revert chat'], 500);
        }
    }
}
