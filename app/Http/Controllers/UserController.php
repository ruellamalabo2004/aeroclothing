<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    // Fetch all users with profile information
    public function index()
    {
        return response()->json(User::all(), 200);
    }
    // Fetch customers (users with role 'customer')
    public function getCustomers()
    {
        $customers = User::where('role', 'customer')
            ->leftJoin('profiles', 'users.id', '=', 'profiles.user_id')
            ->select(
                'users.id',
                'users.email',
                'users.role',
                'users.status',
                'profiles.first_name',
                'profiles.last_name',
                'profiles.suffix',
                'profiles.profile_pic', // Added for Profile Pic
                'profiles.phone_number',        // Added for Phone
                'profiles.gender',       // Added for Gender
                'profiles.date_of_birth', // Added for Date of Birth
                DB::raw("CONCAT(COALESCE(profiles.first_name, ''), ' ', COALESCE(profiles.last_name, ''), ' ', COALESCE(profiles.suffix, '')) AS full_name")
            )
            ->get();

        return response()->json(['data' => $customers], 200);
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
                'profiles.last_name',
                'profiles.suffix',
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
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'suffix' => 'nullable|string|max:10',
            'email' => 'required|email|unique:users,email',
            'phone_number' => 'nullable|string|max:20',
            'gender' => 'nullable|in:Male,Female,Other',
            'date_of_birth' => 'nullable|date',
            'password' => 'required|string|min:6',
            'role' => 'nullable|string',
        ]);
    
        DB::beginTransaction();
        try {
            // ✅ 1. Create user in `users` table
            $user = User::create([
                'email' => $request->email,
                'password' => bcrypt($request->password),
                'role' => $request->role ?? 'customer',
                'status' => 'Active',
            ]);
    
            // ✅ 2. Create profile in `profiles` table linked to user
            $user->profile()->create([
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name,
                'last_name' => $request->last_name,
                'suffix' => $request->suffix,
                'phone_number' => $request->phone_number,
                'gender' => $request->gender,
                'date_of_birth' => $request->date_of_birth,
            ]);
    
            DB::commit();
    
            return response()->json([
                'message' => 'User created successfully',
                'data' => $user->load('profile') // ✅ Include profile in response
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error creating user', 'error' => $e->getMessage()], 500);
        }
    }
    
   public function getCustomerCount()
{
    try {
        // Fetch all users that are customers
        $customers = User::where('is_admin', false)->get(); 
        
        // Debugging: Log the customers to check the result
        \Log::info("Fetched customers:", $customers->toArray());

        return response()->json([
            'total_customers' => $customers->count()
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Failed to fetch customer count'
        ], 500);
    }
}
public function getTotalUsers()
{
    $count = User::count();
    return response()->json(['total_users' => $count]);
}


    public function update(Request $request, $id)
    {
        // Find the user by ID
        $user = User::find($id);
    
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
    
        // Validate incoming data
        $request->validate([
            'email' => 'email|unique:users,email,' . $id,
            'role' => 'nullable|string',
            'status' => 'in:Active,Archived',
            'full_name' => 'nullable|string',
            'phone_number' => 'nullable|string',
            'gender' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
        ]);
    
        // Update the users table
        $user->update($request->only('email', 'role', 'status'));
    
        // Split the full name to first_name, last_name, and suffix if provided
        if ($request->has('full_name')) {
            $nameParts = explode(" ", $request->input('full_name'));
            $first_name = $nameParts[0];
            $last_name = isset($nameParts[1]) ? $nameParts[1] : '';
            $suffix = isset($nameParts[2]) ? $nameParts[2] : '';
    
            // Update the profiles table
            $user->profile()->update([
                'first_name' => $first_name,
                'last_name' => $last_name,
                'suffix' => $suffix,
                'phone_number' => $request->input('phone_number', $user->profile->phone_number),
                'gender' => $request->input('gender', $user->profile->gender),
                'date_of_birth' => $request->input('date_of_birth', $user->profile->date_of_birth),
            ]);
        }
    
        // Return a successful response with the updated data
        return response()->json(['message' => 'User updated successfully', 'data' => $user], 200);
    }
    

    // Archive a user
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

    // Restore an archived user
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

    // Fetch authenticated customer's profile
    public function getAuthenticatedCustomerProfile(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if ($user->role !== 'customer') {
            return response()->json(['message' => 'Access denied. Only customers can view profiles.'], 403);
        }

        // Fetch user with profile data
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
                'profiles.phone',
                'profiles.gender',
                'profiles.date_of_birth',
                'profiles.profile_image'
            )
            ->first();

        // Should always return a result due to leftJoin
        if (!$customer) {
            return response()->json(['message' => 'User not found'], 404); // Unlikely due to auth
        }

        // If no profile exists, create a default one
        if (!$customer->first_name && !$customer->last_name) {
            $profile = new \App\Models\Profile();
            $profile->user_id = $user->id;
            $profile->first_name = 'Default';
            $profile->last_name = 'Customer';
            $profile->save();

            // Refetch with the new profile
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
                    'profiles.phone',
                    'profiles.gender',
                    'profiles.date_of_birth',
                    'profiles.profile_image'
                )
                ->first();
        }

        return response()->json($customer, 200);
    }

    // Update authenticated customer's profile
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
            'email' => 'email|unique:users,email,' . $user->id,
            'first_name' => 'nullable|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'suffix' => 'nullable|string|max:50',
            'phone' => 'nullable|string|max:20',
            'gender' => 'nullable|in:Male,Female,Other',
            'date_of_birth' => 'nullable|date',
            'profile_image' => 'nullable|image|max:1024', // 1MB limit
        ]);

        // Update user table
        $user->email = $request->email ?? $user->email;
        $user->save();

        // Update or create profile
        $profile = $user->profile ?? new \App\Models\Profile(['user_id' => $user->id]);
        $profile->first_name = $request->first_name ?? $profile->first_name;
        $profile->middle_name = $request->middle_name ?? $profile->middle_name;
        $profile->last_name = $request->last_name ?? $profile->last_name;
        $profile->suffix = $request->suffix ?? $profile->suffix;
        $profile->phone = $request->phone ?? $profile->phone;
        $profile->gender = $request->gender ?? $profile->gender;
        $profile->date_of_birth = $request->date_of_birth ?? $profile->date_of_birth;

        if ($request->hasFile('profile_image')) {
            $file = $request->file('profile_image');
            $path = $file->store('profiles', 'public');
            $profile->profile_image = $path;
        }

        $profile->save();

        // Return updated data
        $updatedData = [
            'id' => $user->id,
            'email' => $user->email,
            'role' => $user->role,
            'status' => $user->status,
            'first_name' => $profile->first_name,
            'middle_name' => $profile->middle_name,
            'last_name' => $profile->last_name,
            'suffix' => $profile->suffix,
            'phone' => $profile->phone,
            'gender' => $profile->gender,
            'date_of_birth' => $profile->date_of_birth,
            'profile_image' => $profile->profile_image,
        ];

        return response()->json($updatedData, 200);
    }
}