<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    // Fetch all users with profile information
    public function index()
{
    $users = User::leftJoin('profiles', 'users.id', '=', 'profiles.user_id')
        ->select(
            'users.id',
            'users.email',
            'users.role',
            'users.status',
            'users.created_at',
            'profiles.first_name',
            'profiles.middle_name',
            'profiles.last_name',
            'profiles.suffix',
            'profiles.gender',
            'profiles.date_of_birth',
            'profiles.profile_pic',
            DB::raw("CONCAT(COALESCE(profiles.first_name, ''), ' ', COALESCE(profiles.middle_name, ''), ' ', COALESCE(profiles.last_name, ''), ' ', COALESCE(profiles.suffix, '')) AS full_name")
        )
        ->get();

    return response()->json($users, 200);
}

    // Fetch customers (users with role 'customer')
    public function getCustomers()
    {
        try {
            $customers = User::where('role', 'customer')
                ->with('profile')
                ->leftJoin('profiles', 'users.id', '=', 'profiles.user_id')
                ->select(
                    'users.id',
                    'users.email',
                    'users.role',
                    'users.status',
                    'profiles.first_name',
                    'profiles.middle_name',
                    'profiles.last_name',
                    'profiles.suffix',
                    'profiles.profile_pic',
                    'profiles.gender',
                    'profiles.date_of_birth',
                    DB::raw("CONCAT(COALESCE(profiles.first_name, ''), ' ', COALESCE(profiles.middle_name, ''), ' ', COALESCE(profiles.last_name, ''), ' ', COALESCE(profiles.suffix, '')) AS full_name")
                )
                ->get();

            Log::info('Fetched customers:', ['count' => $customers->count()]);
            return response()->json(['data' => $customers], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching customers:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to fetch customers', 'error' => $e->getMessage()], 500);
        }
    }

    // Fetch a single user by ID
    public function show($id)
    {
        $user = User::leftJoin('profiles', 'users.id', '=', 'profiles.user_id')
            ->where('users.id', $id)
            ->select(
                'users.id',
                'users.email',
                'users.role',
                'users.status',
                'profiles.first_name',
                'profiles.middle_name',
                'profiles.last_name',
                'profiles.suffix',
                'profiles.gender',
                'profiles.date_of_birth',
                'profiles.profile_pic',
                DB::raw("CONCAT(COALESCE(profiles.first_name, ''), ' ', COALESCE(profiles.last_name, ''), ' ', COALESCE(profiles.suffix, '')) AS full_name")
            )
            ->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json(['data' => $user], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'nullable|string|in:customer,admin',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'suffix' => 'nullable|string|max:10',
            'gender' => 'nullable|in:Male,Female,Other',
            'date_of_birth' => 'nullable|date',
            'profile_pic' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        DB::beginTransaction();
        try {
            $user = User::create([
                'email' => $request->email,
                'password' => bcrypt($request->password),
                'role' => $request->role ?? 'customer',
                'status' => 'active',
            ]);

            $profileData = [
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name,
                'last_name' => $request->last_name,
                'suffix' => $request->suffix,
                'gender' => $request->gender,
                'date_of_birth' => $request->date_of_birth,
            ];

            if ($request->hasFile('profile_pic')) {
                $profileData['profile_pic'] = $request->file('profile_pic')->store('profiles', 'public');
            }

            $user->profile()->create($profileData);

            DB::commit();

            Log::info('User created successfully:', ['id' => $user->id, 'user' => $user->load('profile')->toArray()]);

            return response()->json([
                'message' => 'User created successfully',
                'data' => $user->load('profile')
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating user:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error creating user', 'error' => $e->getMessage()], 500);
        }
    }

    public function getCustomerCount()
    {
        try {
            $customers = User::where('role', 'customer')->get();
            Log::info('Fetched customers for count:', ['count' => $customers->count()]);
            return response()->json(['total_customers' => $customers->count()], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching customer count:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to fetch customer count'], 500);
        }
    }

    public function getTotalUsers()
    {
        $count = User::count();
        return response()->json(['total_users' => $count], 200);
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Log raw input to debug FormData parsing
        Log::info('Raw input:', ['input' => $request->input(), 'files' => $request->files->all()]);

        $request->validate([
            'email' => 'required|email|unique:users,email,' . $id,
            'role' => 'nullable|string|in:customer,admin',
            'status' => 'in:active,archived',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'suffix' => 'nullable|string|max:10',
            'gender' => 'nullable|in:Male,Female,Other',
            'date_of_birth' => 'nullable|date',
            'profile_pic' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        Log::info('Updating user:', ['id' => $id, 'request_data' => $request->all()]);

        try {
            $user->update([
                'email' => $request->email,
                'role' => $request->role ?? $user->role,
                'status' => $request->status ?? $user->status,
            ]);

            $profileData = [
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name ?? $user->profile->middle_name ?? null,
                'last_name' => $request->last_name,
                'suffix' => $request->suffix ?? $user->profile->suffix ?? null,
                'gender' => $request->gender ?? $user->profile->gender ?? null,
                'date_of_birth' => $request->date_of_birth ?? $user->profile->date_of_birth ?? null,
            ];

            if ($request->hasFile('profile_pic')) {
                $profileData['profile_pic'] = $request->file('profile_pic')->store('profiles', 'public');
            }

            $user->profile()->updateOrCreate(
                ['user_id' => $user->id],
                $profileData
            );

            Log::info('User updated successfully:', ['id' => $id, 'user' => $user->load('profile')->toArray()]);

            return response()->json([
                'message' => 'User updated successfully',
                'data' => $user->load('profile')
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error updating user:', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Error updating user', 'error' => $e->getMessage()], 500);
        }
    }

    public function archive(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        if ($user->status === 'archived') {
            return response()->json(['message' => 'User is already archived'], 400);
        }
        $user->update(['status' => 'archived']);
        return response()->json(['message' => 'User archived successfully', 'data' => $user], 200);
    }

    public function restore(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        if ($user->status === 'active') {
            return response()->json(['message' => 'User is already active'], 400);
        }
        $user->update(['status' => 'active']);
        return response()->json(['message' => 'User restored successfully', 'data' => $user], 200);
    }

    public function getAuthenticatedCustomerProfile(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        if ($user->role !== 'customer') {
            return response()->json(['message' => 'Access denied. Only customers can view profiles.'], 403);
        }

        $customer = User::where('users.id', $user->id)
            ->leftJoin('profiles', 'users.id', '=', 'profiles.user_id')
            ->select(
                'users.id',
                'users.email',
                'users.role',
                'users.status',
                'profiles.first_name',
                'profiles.middle_name',
                'profiles.last_name',
                'profiles.suffix',
                'profiles.gender',
                'profiles.date_of_birth',
                'profiles.profile_pic'
            )
            ->first();

        if (!$customer) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if (!$customer->first_name && !$customer->last_name) {
            $profile = new \App\Models\Profile();
            $profile->user_id = $user->id;
            $profile->first_name = 'Default';
            $profile->last_name = 'Customer';
            $profile->save();

            $customer = User::where('users.id', $user->id)
                ->leftJoin('profiles', 'users.id', '=', 'profiles.user_id')
                ->select(
                    'users.id',
                    'users.email',
                    'users.role',
                    'users.status',
                    'profiles.first_name',
                    'profiles.middle_name',
                    'profiles.last_name',
                    'profiles.suffix',
                    'profiles.gender',
                    'profiles.date_of_birth',
                    'profiles.profile_pic'
                )
                ->first();
        }

        return response()->json($customer, 200);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        if ($user->role !== 'customer') {
            return response()->json(['message' => 'Access denied. Only customers can update profiles.'], 403);
        }

        $request->validate([
            'email' => 'required|email|unique:users,email,' . $user->id,
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'suffix' => 'nullable|string|max:10',
            'gender' => 'nullable|in:Male,Female,Other',
            'date_of_birth' => 'nullable|date',
            'profile_pic' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        Log::info('Updating user profile:', ['id' => $user->id, 'request_data' => $request->all()]);

        try {
            $user->email = $request->email;
            $user->save();

            $profile = $user->profile ?? new \App\Models\Profile(['user_id' => $user->id]);
            $profile->first_name = $request->first_name;
            $profile->middle_name = $request->middle_name ?? $profile->middle_name;
            $profile->last_name = $request->last_name;
            $profile->suffix = $request->suffix ?? $profile->suffix;
            $profile->gender = $request->gender ?? $profile->gender;
            $profile->date_of_birth = $request->date_of_birth ?? $profile->date_of_birth;

            if ($request->hasFile('profile_pic')) {
                $path = $request->file('profile_pic')->store('profiles', 'public');
                $profile->profile_pic = $path;
            }

            $profile->save();

            Log::info('User profile updated successfully:', ['id' => $user->id, 'profile' => $profile->toArray()]);

            $updatedData = [
                'id' => $user->id,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
                'first_name' => $profile->first_name,
                'middle_name' => $profile->middle_name,
                'last_name' => $profile->last_name,
                'suffix' => $profile->suffix,
                'gender' => $profile->gender,
                'date_of_birth' => $profile->date_of_birth,
                'profile_pic' => $profile->profile_pic,
            ];

            return response()->json([
                'message' => 'Profile updated successfully',
                'user' => $user,
                'profile' => $updatedData
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error updating user profile:', ['id' => $user->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Error updating profile', 'error' => $e->getMessage()], 500);
        }
    }
}