<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // Fetch all users
    public function index()
    {
        $users = User::all();
        return response()->json(['data' => $users], 200);
    }

    // Fetch a single user by ID
    public function show($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json(['data' => $user], 200);
    }

    // Store a new user
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users,email', // Adjusted to match your model
            'password' => 'required|string|min:6',
            'role' => 'nullable|string', // Added role since it's in your model
        ]);

        $user = User::create([
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role' => $request->role,
            'status' => 'Active', // Ensure new users are Active
        ]);

        return response()->json(['message' => 'User created successfully', 'data' => $user], 201);
    }

    // Update user (including status for edit action)
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $request->validate([
            'email' => 'email|unique:users,email,' . $id,
            'role' => 'nullable|string',
            'status' => 'in:Active,Archived', // Validate status
        ]);

        $user->update($request->only('email', 'role', 'status')); // Allow status update

        return response()->json(['message' => 'User updated successfully', 'data' => $user], 200);
    }

    // Archive a user (POST method for frontend compatibility)
    public function archive(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($user->status === 'Archived') {
            return response()->json(['message' => 'User is already archived'], 400);
        }

        $user->update(['status' => 'Archived']);

        return response()->json(['message' => 'User archived successfully', 'data' => $user], 200);
    }

    // Restore an archived user (optional, for completeness)
    public function restore(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($user->status === 'Active') {
            return response()->json(['message' => 'User is already active'], 400);
        }

        $user->update(['status' => 'Active']);

        return response()->json(['message' => 'User restored successfully', 'data' => $user], 200);
    }
}