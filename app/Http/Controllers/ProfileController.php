<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class ProfileController extends Controller
{
    /**
     * Retrieve the user's profile (publicly accessible).
     */
    public function getProfile(Request $request)
    {
        $user = Auth::user();
        $defaultProfile = [
            'first_name' => '',
            'middle_name' => '',
            'last_name' => '',
            'suffix' => '',
            'email' => '',
            'phone' => '',
            'gender' => '',
            'date_of_birth' => '',
            'role' => '',
            'profile_image' => asset('default-avatar.png'),
        ];

        if (!$user) {
            return response()->json($defaultProfile, 200);
        }

        $profile = $user->profile;

        return response()->json([
            'first_name' => $profile ? $profile->first_name ?? '' : '',
            'middle_name' => $profile ? $profile->middle_name ?? '' : '',
            'last_name' => $profile ? $profile->last_name ?? '' : '',
            'suffix' => $profile ? $profile->suffix ?? '' : '',
            'email' => $user->email ?? '',
            'phone' => $profile ? $profile->phone_number ?? '' : '',
            'gender' => $profile ? $profile->gender ?? '' : '',
            'date_of_birth' => $profile && $profile->date_of_birth ? $profile->date_of_birth->toDateString() : '',
            'role' => $user->role ?? '',
            'profile_image' => $profile && $profile->profile_pic 
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

        $profile = $user->profile ?? $user->profile()->create();

        $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'suffix' => 'nullable|string|max:10',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'phone_number' => 'nullable|string|max:20', // Changed to phone_number
            'gender' => 'nullable|string|in:male,female,other',
            'date_of_birth' => 'nullable|date',
            'role' => 'nullable|string|max:50', // Added role validation
        ]);

        DB::beginTransaction();
        try {
            $profile->update([
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name,
                'last_name' => $request->last_name,
                'suffix' => $request->suffix,
                'phone_number' => $request->phone_number,
                'gender' => $request->gender,
                'date_of_birth' => $request->date_of_birth,
            ]);

            if ($user->email !== $request->email) {
                $user->update(['email' => $request->email]);
            }

            if ($request->role && $user->role !== $request->role) {
                $user->update(['role' => $request->role]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Profile updated successfully',
                'profile' => [
                    'first_name' => $profile->first_name,
                    'middle_name' => $profile->middle_name ?? '',
                    'last_name' => $profile->last_name,
                    'suffix' => $profile->suffix ?? '',
                    'email' => $user->email,
                    'phone' => $profile->phone_number ?? '',
                    'gender' => $profile->gender ?? '',
                    'date_of_birth' => $profile->date_of_birth ? $profile->date_of_birth->toDateString() : null,
                    'role' => $user->role ?? '',
                    'profile_image' => $profile->profile_pic 
                        ? asset('storage/' . $profile->profile_pic) 
                        : asset('default-avatar.png'),
                ]
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Profile update failed', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Upload a profile photo for the authenticated user.
     */
    public function uploadPhoto(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $profile = $user->profile ?? $user->profile()->create();

        $request->validate([
            'profile_photo' => 'required|image|mimes:jpg,jpeg,png|max:2048', // Changed to profile_photo
        ]);

        DB::beginTransaction();
        try {
            if ($profile->profile_pic) {
                Storage::disk('public')->delete($profile->profile_pic);
            }

            $path = $request->file('profile_photo')->store('profile_pics', 'public');
            $profile->profile_pic = $path;
            $profile->save();

            DB::commit();

            return response()->json([
                'message' => 'Profile photo uploaded successfully',
                'profile_image' => asset('storage/' . $path),
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Photo upload failed', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Change the authenticated user's password.
     */
    public function changePassword(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['errors' => ['current_password' => ['Current password is incorrect']]], 422);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json(['message' => 'Password changed successfully'], 200);
    }
}