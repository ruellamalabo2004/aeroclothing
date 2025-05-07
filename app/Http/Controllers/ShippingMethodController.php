<?php

namespace App\Http\Controllers;

use App\Models\ShippingMethod;
use Illuminate\Http\Request;

class ShippingMethodController extends Controller
{
    // ... existing code ...
    public function index()
    {
        try {
            $shippingMethods = ShippingMethod::all();
            \Log::info('Shipping methods retrieved:', ['count' => $shippingMethods->count()]);
            return response()->json([
                'status' => 'success',
                'data' => $shippingMethods
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching shipping methods: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch shipping methods'
            ], 500);
        }
    }
// ... existing code ...

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'required|string',
            'fee' => 'required|numeric|min:0',
        ]);

        return ShippingMethod::create($validated);
    }

    public function show($id)
    {
        return ShippingMethod::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $shipping = ShippingMethod::findOrFail($id);
        $shipping->update($request->only('name', 'description', 'fee'));
        return $shipping;
    }

    public function destroy($id)
    {
        ShippingMethod::destroy($id);
        return response()->noContent();
    }
}

