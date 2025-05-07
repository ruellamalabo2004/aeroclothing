<?php

namespace App\Http\Controllers;

use App\Models\Country;
use Illuminate\Http\Request;

class CountryController extends Controller
{
    // Fetch all countries
    public function index()
    {
        $countries = Country::all();
        return response()->json($countries);
    }

    // Store a new country
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'iso_code' => 'required|string|max:10|unique:countries,iso_code',  // Ensure unique ISO codes
        ]);

        $country = Country::create($data);
        return response()->json($country, 201);
    }

    // Show a specific country
    public function show($id)
    {
        $country = Country::findOrFail($id);
        return response()->json($country);
    }

    // Update a specific country
    public function update(Request $request, $id)
    {
        $country = Country::findOrFail($id);

        // Validate the updated data
        $data = $request->validate([
            'name' => 'nullable|string|max:255',
            'iso_code' => 'nullable|string|max:10|unique:countries,iso_code,' . $id,  // Allow the same ISO code when updating
        ]);

        $country->update($data);
        return response()->json(['message' => 'Country updated successfully']);
    }

    // Delete a specific country
    public function destroy($id)
    {
        $country = Country::findOrFail($id);

        // Check if the country is used in addresses
        if ($country->addresses()->count() > 0) {
            return response()->json(['message' => 'Cannot delete country as it is associated with existing addresses'], 400);
        }

        $country->delete();
        return response()->json(['message' => 'Country deleted successfully']);
    }
}
