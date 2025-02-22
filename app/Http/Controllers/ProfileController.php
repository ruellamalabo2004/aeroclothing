<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Profile;
use Carbon\Carbon;

class ProfileController extends Controller
{
    /**
     * Display a listing of the profiles.
     */
    public function index()
    {
        $profiles = Profile::all();
        return response()->json($profiles);
    }

    /**
     * Store a newly created profile in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'first_name'   => 'required|string|max:100',
            'middle_name'  => 'nullable|string|max:100',
            'last_name'    => 'required|string|max:100',
            'date_of_birth'=> 'required|date',
            'gender'       => 'required|in:male,female,other',
            'age'          => 'required|integer',
            'profile_pic'  => 'nullable|string|max:100',
            'archive_at'   => 'nullable|date',
        ]);

        $profile = Profile::create([
            'first_name'   => $request->first_name,
            'middle_name'  => $request->middle_name,
            'last_name'    => $request->last_name,
            'date_of_birth'=> Carbon::parse($request->date_of_birth),
            'gender'       => $request->gender,
            'age'          => $request->age,
            'profile_pic'  => $request->profile_pic,
            'archive_at'   => $request->archive_at ? Carbon::parse($request->archive_at) : null,
        ]);

        return response()->json(['message' => 'Profile created successfully', 'profile' => $profile], 201);
    }

    /**
     * Display the specified profile.
     */
    public function show($id)
    {
        $profile = Profile::find($id);
        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }
        return response()->json($profile);
    }

    /**
     * Update the specified profile.
     */
    public function update(Request $request, $id)
    {
        $profile = Profile::find($id);
        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        $request->validate([
            'first_name'   => 'sometimes|string|max:100',
            'middle_name'  => 'nullable|string|max:100',
            'last_name'    => 'sometimes|string|max:100',
            'date_of_birth'=> 'sometimes|date',
            'gender'       => 'sometimes|in:male,female,other',
            'age'          => 'sometimes|integer',
            'profile_pic'  => 'nullable|string|max:100',
            'archive_at'   => 'nullable|date',
        ]);

        $profile->update($request->all());

        return response()->json(['message' => 'Profile updated successfully', 'profile' => $profile]);
    }

    /**
     * Remove the specified profile from storage.
     */
    public function destroy($id)
    {
        $profile = Profile::find($id);
        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        $profile->delete();

        return response()->json(['message' => 'Profile deleted successfully']);
    }
}
