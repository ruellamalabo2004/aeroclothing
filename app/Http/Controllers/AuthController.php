<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use App\Models\Profile;

class AuthController extends Controller
{
    public function register(Request $request)
    {
     
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email|max:100|unique:users',
            'password' => 'required|string|min:6',
            'first_name' => 'required|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'last_name' => 'required|string|max:100',
            'suffix' => 'nullable|string|max:10',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:Male,Female,Other',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $role = str_ends_with($request->email, '@admin.com') ? 'admin' : 'customer';

   
        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $role,
            'status' => 'Active', // Ensure new users are Active
        ]);

        Profile::create([
            'user_id' => $user->id,
            'first_name' => $request->first_name,
            'middle_name' => $request->middle_name,
            'last_name' => $request->last_name,
            'suffix' => $request->suffix,
            'date_of_birth' => $request->date_of_birth,
            'gender' => $request->gender,
        ]);

        return response()->json([
            'message' => 'User registered successfully!',
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'role' => $user->role
            ]
        ], 201);
    }
    public function changePassword(Request $request)
    {
        // Validate input
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);
    
        $user = Auth::user();
    
        // Check if the current password is correct
        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }
    
        // Update password
        $user->password = Hash::make($request->new_password);
        $user->save();
    
        return response()->json(['message' => 'Password updated successfully'], 200);
    }
    public function profile()
    {
        $user = Auth::user();
    
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
    
        $profile = Profile::where('user_id', $user->id)->first();
    
        return response()->json([
            'user' => $user,
            'profile' => $profile
        ], 200);
    }
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $profile = $user->profile;
        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        $validatedData = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'suffix' => 'nullable|string|max:10',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone_number' => 'nullable|string|max:20', // Changed to phone_number
            'gender' => 'nullable|string|in:Male,Female,Other',
            'date_of_birth' => 'nullable|date',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048', // Form field name
        ]);

        // Update user email
        $user->email = $validatedData['email'];
        $user->save();

        // Prepare profile data, excluding fields not in $fillable
        $profileData = array_diff_key($validatedData, ['email' => '', 'profile_image' => '']);
        
        // Handle profile image update
        if ($request->hasFile('profile_image')) {
            // Delete old image if it exists
            if ($profile->profile_pic) { // Use profile_pic
                Storage::disk('public')->delete($profile->profile_pic);
            }
            $imagePath = $request->file('profile_image')->store('profile_images', 'public');
            $profileData['profile_pic'] = $imagePath; // Use profile_pic
        }

        // Update profile with fillable fields
        $profile->update($profileData);

        return response()->json([
            'message' => 'Profile updated successfully',
            'first_name' => $profile->first_name,
            'middle_name' => $profile->middle_name,
            'last_name' => $profile->last_name,
            'suffix' => $profile->suffix,
            'email' => $user->email,
            'phone_number' => $profile->phone_number, // Changed to phone_number
            'gender' => $profile->gender,
            'date_of_birth' => $profile->date_of_birth,
            'profile_image' => $profile->profile_pic ? asset("storage/{$profile->profile_pic}") : null // Return profile_pic
        ]);
    }
    public function logout(Request $request)
    {
        $request->user()->token()->revoke();
    
        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    }
    
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required'
        ]);
    
        if ($validator->fails()) {
            return response()->json(['message' => 'Invalid credentials', 'errors' => $validator->errors()], 400);
        }
    
        $user = User::where('email', $request->email)->first();
    
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid email or password'], 401);
        }
    
        // Check if the user is archived
        if ($user->status === 'Archived') {
            return response()->json([
                'message' => 'Your account was suspended, please contact support'
            ], 403);
        }



    
        $token = $user->createToken('MyApp')->accessToken;
    
        // Fetch the user's profile
        $profile = Profile::where('user_id', $user->id)->first();
    
        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'profile' => $profile
        ], 200);
    }
}    