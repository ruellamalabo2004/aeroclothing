<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Retrieve the authenticated user's profile.
     */
    public function getProfile(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $profile = $user->profile;
        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        return response()->json([
            'first_name' => $profile->first_name,
            'middle_name' => $profile->middle_name ?? '',
            'last_name' => $profile->last_name,
            'suffix' => $profile->suffix ?? '',
            'email' => $user->email, // From users table
            'phone' => $profile->phone ?? '',
            'gender' => $profile->gender ?? '',
            'date_of_birth' => $profile->date_of_birth ? $profile->date_of_birth->toDateString() : null,
            'age' => $profile->age ?? null, // Assuming age is calculated
            'profile_image' => $profile->profile_pic 
                ? asset('storage/' . $profile->profile_pic) 
                : asset('default-avatar.png'),
        ], 200);
    }

    /**
     * Update the authenticated user's profile.
     */
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

        // Validate input data
        $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'suffix' => 'nullable|string|max:10',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'gender' => 'nullable|string|in:male,female,other',
            'date_of_birth' => 'nullable|date',
            'profile_pic' => 'nullable|image|mimes:jpg,jpeg,png|max:2048', // Image validation
        ]);

        // Handle profile picture upload
        if ($request->hasFile('profile_pic')) {
            // Delete old profile picture if exists
            if ($profile->profile_pic) {
                Storage::disk('public')->delete($profile->profile_pic);
            }

            $file = $request->file('profile_pic');
            $path = $file->store('profile_pics', 'public');
            $profile->profile_pic = $path;
        }

        // Update profile data
        $profile->update([
            'first_name' => $request->first_name,
            'middle_name' => $request->middle_name,
            'last_name' => $request->last_name,
            'suffix' => $request->suffix,
            'phone' => $request->phone,
            'gender' => $request->gender,
            'date_of_birth' => $request->date_of_birth,
        ]);

        // Update user's email separately
        if ($user->email !== $request->email) {
            $user->update(['email' => $request->email]);
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'profile' => [
                'first_name' => $profile->first_name,
                'middle_name' => $profile->middle_name ?? '',
                'last_name' => $profile->last_name,
                'suffix' => $profile->suffix ?? '',
                'email' => $user->email,
                'phone' => $profile->phone ?? '',
                'gender' => $profile->gender ?? '',
                'date_of_birth' => $profile->date_of_birth ? $profile->date_of_birth->toDateString() : null,
                'profile_picture' => $profile->profile_pic 
                    ? asset('storage/' . $profile->profile_pic) 
                    : asset('default-avatar.png'),
            ]
        ], 200);
    }
}
