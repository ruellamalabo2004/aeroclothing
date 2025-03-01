<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Inventory;

class InventoryController extends Controller
{
    // Get all inventory items (including archived if needed)
    public function index()
    {
        return response()->json(Inventory::withTrashed()->get());
    }

    // Store a new inventory item
    public function store(Request $request)
    {
        $request->validate([
            'product' => 'required|string|max:255', 
            'category' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'price' => 'required|numeric',
            'sizes' => 'required|string',
            'stock_quantity' => 'required|integer',
            'status' => 'required|string|in:Available,Low Stock,Out of Stock',
        ]);

        $inventory = Inventory::create($request->all());

        return response()->json(['message' => 'Inventory item added successfully', 'data' => $inventory], 201);
    }

    // Show a single inventory item by ID
    public function show($id)
    {
        $inventory = Inventory::withTrashed()->find($id);

        if (!$inventory) {
            return response()->json(['message' => 'Item not found'], 404);
        }

        return response()->json($inventory);
    }

    // Update an inventory item by ID
    public function update(Request $request, $id)
    {
        $inventory = Inventory::withTrashed()->find($id);

        if (!$inventory) {
            return response()->json(['message' => 'Item not found'], 404);
        }

        $request->validate([
            'product' => 'required|string|max:255', 
            'category' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'price' => 'required|numeric',
            'sizes' => 'required|string',
            'stock_quantity' => 'required|integer',
            'status' => 'required|string|in:Available,Low Stock,Out of Stock',
        ]);

        $inventory->update($request->all());

        return response()->json(['message' => 'Inventory item updated successfully', 'data' => $inventory]);
    }

    // Archive an inventory item (Soft Delete)
    public function destroy($id)
    {
        $inventory = Inventory::find($id);

        if (!$inventory) {
            return response()->json(['message' => 'Item not found'], 404);
        }

        $inventory->delete();

        return response()->json(['message' => 'Inventory item archived successfully']);
    }

    // Restore an archived inventory item
    public function restore($id)
    {
        $inventory = Inventory::onlyTrashed()->find($id);

        if (!$inventory) {
            return response()->json(['message' => 'Item not found'], 404);
        }

        $inventory->restore();

        return response()->json(['message' => 'Inventory item restored successfully']);
    }
}