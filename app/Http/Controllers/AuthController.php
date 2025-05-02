<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use App\Models\Profile;
use App\Models\Role;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // Register a new user
    public function register(Request $request)
    {
        // Validate incoming request data
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email|max:100|unique:users',
            'password' => 'required|string|min:6|confirmed', // Added confirmation rule for password
            'first_name' => 'required|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'last_name' => 'required|string|max:100',
            'suffix' => 'nullable|string|max:10',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:Male,Female,Other',
        ]);

        // If validation fails, return errors
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        // Get role ID based on email domain
        $roleName = str_ends_with($request->email, '@admin.com') ? 'admin' : 'customer';
        $role = Role::where('name', $roleName)->first();
        
        if (!$role) {
            // Fallback to customer role if admin role doesn't exist
            $role = Role::where('name', 'customer')->first();
            
            // If no roles exist at all, return an error
            if (!$role) {
                return response()->json(['message' => 'System error: Role not found. Please contact administrator.'], 500);
            }
        }

        // Create new user
        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $role->id,
            'status' => 'Active', // Ensure new users are Active
        ]);

        // Create new profile for the user
        Profile::create([
            'user_id' => $user->id,
            'first_name' => $request->first_name,
            'middle_name' => $request->middle_name,
            'last_name' => $request->last_name,
            'suffix' => $request->suffix,
            'date_of_birth' => $request->date_of_birth,
            'gender' => $request->gender,
        ]);

        // Return success response with user data
        return response()->json([
            'message' => 'User registered successfully!',
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'role' => $role->name // Return role name instead of ID for frontend
            ]
        ], 201);
    }

    // Login method needs updating to return role name instead of role_id
    public function login(Request $request)
    {
        // Validate incoming login request
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required'
        ]);

        // If validation fails, return error response
        if ($validator->fails()) {
            return response()->json(['message' => 'Invalid credentials', 'errors' => $validator->errors()], 400);
        }

        // Check if user exists with provided email
        $user = User::with('role')->where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid email or password'], 401);
        }

        // Check if the user's account is archived
        if ($user->status === 'Archived') {
            return response()->json([
                'message' => 'Your account was suspended, please contact support'
            ], 403);
        }

        // Generate access token
        $token = $user->createToken('MyApp')->accessToken;

        // Fetch user profile
        $profile = Profile::where('user_id', $user->id)->first();

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'role' => $user->role ? $user->role->name : null,
                'profile' => $profile
            ]
        ], 200);
    }

    // The rest of the methods remain unchanged...
    public function changePassword(Request $request)
    {
        // Validate current and new password
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);
    
        // Get authenticated user
        $user = Auth::user();
    
        // Check if current password matches the user's stored password
        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }
    
        // Update user password
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
    
        // Fetch the user's profile
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

        // Get the user's profile
        $profile = $user->profile;
        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        // Validate incoming profile data
        $validatedData = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'suffix' => 'nullable|string|max:10',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone_number' => 'nullable|string|max:20',
            'gender' => 'nullable|string|in:Male,Female,Other',
            'date_of_birth' => 'nullable|date',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        // Update user's email
        $user->email = $validatedData['email'];
        $user->save();

        // Prepare profile data, excluding fields not in $fillable
        $profileData = array_diff_key($validatedData, ['email' => '', 'profile_image' => '']);
        
        // Handle profile image upload if exists
        if ($request->hasFile('profile_image')) {
            // Delete old image if exists
            if ($profile->profile_pic) {
                Storage::disk('public')->delete($profile->profile_pic);
            }
            $imagePath = $request->file('profile_image')->store('profile_images', 'public');
            $profileData['profile_pic'] = $imagePath; // Update profile with new image
        }

        // Update profile with new data
        $profile->update($profileData);

        // Return the updated profile details
        return response()->json([
            'message' => 'Profile updated successfully',
            'first_name' => $profile->first_name,
            'middle_name' => $profile->middle_name,
            'last_name' => $profile->last_name,
            'suffix' => $profile->suffix,
            'email' => $user->email,
            'phone_number' => $profile->phone_number,
            'gender' => $profile->gender,
            'date_of_birth' => $profile->date_of_birth,
            'profile_image' => $profile->profile_pic ? asset("storage/{$profile->profile_pic}") : null
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->token()->revoke();
    
        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    }
}