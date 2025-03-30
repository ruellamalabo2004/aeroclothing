<?php

namespace App\Http\Controllers;

use App\Models\Courier;
use Illuminate\Http\Request;

class CourierController extends Controller
{
    // Get all active couriers
    public function index()
    {
        $couriers = Courier::where('is_active', true)->get();
        return response()->json($couriers);
    }

    // Store a new courier
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:couriers,name|max:255',
            'shipping_fee' => 'required|numeric|min:0',
            'estimated_delivery_time' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $courier = Courier::create($validated);
        return response()->json($courier, 201);
    }

    // Update an existing courier
    public function update(Request $request, $id)
    {
        $courier = Courier::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|unique:couriers,name,' . $id . '|max:255',
            'shipping_fee' => 'required|numeric|min:0',
            'estimated_delivery_time' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $courier->update($validated);
        return response()->json($courier);
    }

    // Delete a courier
    public function destroy($id)
    {
        $courier = Courier::findOrFail($id);
        $courier->delete();
        return response()->json(null, 204);
    }
}