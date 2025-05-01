<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Inventory;
use App\Models\Product;

class InventoryController extends Controller
{
    // Determine stock status based on quantity
    private function determineStatus($quantity)
    {
        if ($quantity >= 10) return 'In Stock';
        if ($quantity > 0) return 'Low Stock';
        return 'Out of Stock';
    }

    public function index()
    {
        try {
            $inventory = Inventory::with(['product.category', 'product.brand'])->withTrashed()->get();
            return response()->json($inventory);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching inventory',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'product_id' => 'required|exists:products,id',
            'stock_quantity' => 'required|integer|min:0',
        ]);

        $validatedData['status'] = $this->determineStatus($validatedData['stock_quantity']);

        $inventory = Inventory::create($validatedData);
        $inventory->load(['product.category', 'product.brand']);

        return response()->json(['data' => $inventory], 201);
    }

    public function show($id)
    {
        // Fetch the inventory for the given ID, including associated product details
        $inventory = Inventory::with(['product.category', 'product.brand'])->withTrashed()->find($id);

        if (!$inventory) {
            return response()->json(['message' => 'Inventory item not found'], 404);
        }

        return response()->json($inventory);
    }

    public function update(Request $request, $id)
    {
        $inventory = Inventory::withTrashed()->find($id);

        if (!$inventory) {
            return response()->json(['message' => 'Inventory item not found'], 404);
        }

        $data = $request->validate([
            'product_id' => 'sometimes|exists:products,id',
            'stock_quantity' => 'sometimes|integer|min:0',
        ]);

        if (array_key_exists('stock_quantity', $data)) {
            $data['status'] = $this->determineStatus($data['stock_quantity']);
        }

        $inventory->update($data);
        $inventory->load(['product.category', 'product.brand']);

        return response()->json([
            'message' => 'Inventory item updated successfully',
            'data' => $inventory,
        ]);
    }

    public function destroy($id)
    {
        $inventory = Inventory::find($id);

        if (!$inventory) {
            return response()->json(['message' => 'Inventory item not found'], 404);
        }

        $inventory->delete();

        return response()->json(['message' => 'Inventory item archived successfully']);
    }

    public function restore($id)
    {
        $inventory = Inventory::onlyTrashed()->find($id);

        if (!$inventory) {
            return response()->json(['message' => 'Inventory item not found'], 404);
        }

        $inventory->restore();
        $inventory->load(['product.category', 'product.brand']);

        return response()->json([
            'message' => 'Inventory item restored successfully',
            'data' => $inventory,
        ]);
    }

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
        $inventory->status = $this->determineStatus($inventory->stock_quantity);
        $inventory->save();

        $inventory->load(['product.category', 'product.brand']);

        return response()->json([
            'message' => "Restocked. New quantity: {$inventory->stock_quantity}",
            'data' => $inventory,
        ]);
    }

    // Get inventory by product ID
    public function getInventoryByProductId($id)
    {
        $inventory = Inventory::where('product_id', $id)->first();

        if ($inventory) {
            return response()->json($inventory);
        } else {
            return response()->json(['message' => 'Inventory not found for this product'], 404);
        }
    }

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
        $inventory->status = $this->determineStatus($inventory->stock_quantity);
        $inventory->save();

        $inventory->load(['product.category', 'product.brand']);

        return response()->json([
            'message' => "Stock reduced. New quantity: {$inventory->stock_quantity}",
            'data' => $inventory,
        ]);
    }
}
