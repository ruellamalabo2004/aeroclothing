<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Address;
use Illuminate\Support\Facades\Auth;

class AddressController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        return response()->json(Address::where('user_id', $user->id)->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'recipient_name' => 'required|string',
            'phone_number' => 'required|string',
            'country' => 'required|string',
            'region' => 'required|string',
            'city' => 'required|string',
            'postal_code' => 'required|string',
            'street_address' => 'required|string',
        ]);

        $data['user_id'] = auth()->id();
        $data['is_default'] = Address::where('user_id', auth()->id())->count() === 0;

        $address = Address::create($data);
        return response()->json($address, 201);
    }

    public function show(Address $address) // Add this if not already present
    {
        $this->authorize('update', $address); // Assuming 'update' covers viewing too
        return response()->json($address);
    }

    public function update(Request $request, $id)
{
    $address = Address::findOrFail($id);
    $address->update($request->all());  // You can use validation before this line if needed

    return response()->json(['message' => 'Address updated successfully']);
}


    public function destroy($id)
    {
        $address = Address::findOrFail($id);
        $address->delete();
        
        return response()->json(['message' => 'Address deleted successfully']);
    }
    

    public function setDefault($id)
{
    $address = Address::findOrFail($id);
    
    // Set all other addresses to not default
    Address::where('user_id', $address->user_id)->update(['is_default' => false]);
    
    // Set the selected address as default
    $address->update(['is_default' => true]);

    return response()->json(['message' => 'Address set as default successfully']);
}

}    