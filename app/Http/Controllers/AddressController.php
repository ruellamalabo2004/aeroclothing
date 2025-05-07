<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Country;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AddressController extends Controller
{
    // Fetch all addresses for the authenticated user
    public function index()
    {
        $user = auth()->user();
        $addresses = Address::where('user_id', $user->id)->with('country')->get(); // Load related country data
        return response()->json($addresses);
    }

    // Store a new address for the authenticated user
    public function store(Request $request)
    {
        $data = $request->validate([
            'recipient_name' => 'required|string',
            'phone_number' => 'required|string',
            'country_id' => 'required|exists:countries,id',  // Validating the country ID
            'region' => 'nullable|string',
            'city' => 'nullable|string',
            'postal_code' => 'nullable|string',
            'street_address' => 'required|string',
            'is_default' => 'nullable|boolean',
        ]);

        $data['user_id'] = auth()->id();
        
        // If no address exists, set this one as default
        if (Address::where('user_id', auth()->id())->count() === 0) {
            $data['is_default'] = true;
        } else {
            $data['is_default'] = $data['is_default'] ?? false;  // Default to false if not provided
        }

        // Create the new address
        $address = Address::create($data);
        return response()->json($address, 201);
    }

    // Show a specific address for the authenticated user
    public function show(Address $address)
    {
        $this->authorize('view', $address);  // Ensure user is authorized to view this address
        return response()->json($address);
    }

    // Update a specific address for the authenticated user
    public function update(Request $request, $id)
    {
        $address = Address::findOrFail($id);

        // Ensure the user is allowed to update this address
        if ($address->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Validate request data
        $data = $request->validate([
            'recipient_name' => 'nullable|string',
            'phone_number' => 'nullable|string',
            'country_id' => 'nullable|exists:countries,id',  // Validate the country ID if provided
            'region' => 'nullable|string',
            'city' => 'nullable|string',
            'postal_code' => 'nullable|string',
            'street_address' => 'nullable|string',
            'is_default' => 'nullable|boolean',
        ]);

        // Update the address
        $address->update($data);

        // Set the selected address as default if necessary
        if (isset($data['is_default']) && $data['is_default']) {
            Address::where('user_id', $address->user_id)->update(['is_default' => false]);
            $address->update(['is_default' => true]);
        }

        return response()->json(['message' => 'Address updated successfully']);
    }

    // Delete a specific address for the authenticated user
    public function destroy($id)
    {
        $address = Address::findOrFail($id);

        // Ensure the user is allowed to delete this address
        if ($address->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete the address
        $address->delete();
        
        return response()->json(['message' => 'Address deleted successfully']);
    }

    // Set the address as default
    public function setDefault($id)
    {
        $address = Address::findOrFail($id);
        
        // Ensure the user is allowed to set this address as default
        if ($address->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        // Set all other addresses to not default
        Address::where('user_id', $address->user_id)->update(['is_default' => false]);
        
        // Set the selected address as default
        $address->update(['is_default' => true]);

        return response()->json(['message' => 'Address set as default successfully']);
    }
}
