<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Inventory;
use App\Models\Product;

class InventoryController extends Controller
{
    // Get all inventory items with product details (including archived if needed)
    public function index()
    {
        try {
            $inventory = Inventory::with('product')->withTrashed()->get();
            return response()->json($inventory);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching inventory',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    

    // Store a new inventory item for an existing product
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'product_id' => 'required|exists:products,id', // Ensures product_id exists
            'stock_quantity' => 'required|integer|min:1',
            'status' => 'required|string|in:Available,Low Stock,Out of Stock',
        ]);
    
        $inventory = Inventory::create($validatedData);
    
        return response()->json(['data' => $inventory], 201);
    }
    

    // Show a single inventory item by ID with product details
    public function show($id)
    {
        $inventory = Inventory::with('product')->withTrashed()->find($id);

        if (!$inventory) {
            return response()->json(['message' => 'Inventory item not found'], 404);
        }

        return response()->json($inventory);
    }

    // Update an inventory item by ID
    public function update(Request $request, $id)
    {
        $inventory = Inventory::withTrashed()->find($id);

        if (!$inventory) {
            return response()->json(['message' => 'Inventory item not found'], 404);
        }

        $request->validate([
            'product_id' => 'sometimes|exists:products,id', // Optional, but must exist if provided
            'stock_quantity' => 'sometimes|integer|min:0',
            'status' => 'sometimes|string|in:Available,Low Stock,Out of Stock',
        ]);

        $inventory->update($request->only(['product_id', 'stock_quantity', 'status']));

        return response()->json([
            'message' => 'Inventory item updated successfully',
            'data' => $inventory->load('product'),
        ]);
    }

    // Archive an inventory item (Soft Delete)
    public function destroy($id)
    {
        $inventory = Inventory::find($id);

        if (!$inventory) {
            return response()->json(['message' => 'Inventory item not found'], 404);
        }

        $inventory->delete();

        return response()->json(['message' => 'Inventory item archived successfully']);
    }

    // Restore an archived inventory item
    public function restore($id)
    {
        $inventory = Inventory::onlyTrashed()->find($id);

        if (!$inventory) {
            return response()->json(['message' => 'Inventory item not found'], 404);
        }

        $inventory->restore();

        return response()->json(['message' => 'Inventory item restored successfully']);
    }

    // Restock an inventory item (increase stock_quantity)
    public function restock(Request $request, $id)
    {
        $inventory = Inventory::find($id);

        if (!$inventory) {
            return response()->json(['message' => 'Inventory item not found'], 404);
        }

        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $inventory->stock_quantity += $request->quantity;
        $inventory->save(); // Triggers status update in model (if using booted method)

        return response()->json([
            'message' => "Restocked. New quantity: {$inventory->stock_quantity}",
            'data' => $inventory->load('product'),
        ]);
    }

    // Reduce stock for an inventory item
    public function reduceStock(Request $request, $id)
    {
        $inventory = Inventory::find($id);

        if (!$inventory) {
            return response()->json(['message' => 'Inventory item not found'], 404);
        }

        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $inventory->stock_quantity = max(0, $inventory->stock_quantity - $request->quantity);
        $inventory->save(); // Triggers status update in model (if using booted method)

        return response()->json([
            'message' => "Stock reduced. New quantity: {$inventory->stock_quantity}",
            'data' => $inventory->load('product'),
        ]);
    }
}