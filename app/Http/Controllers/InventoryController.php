<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Inventory;
use App\Models\Product;
use Illuminate\Support\Facades\Log;

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
            $inventory = Inventory::with(['product.category', 'product.brand'])
                ->whereNull('archive_at')
                ->get();
            return response()->json($inventory);
        } catch (\Exception $e) {
            Log::error('Error fetching inventory list: ', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error fetching inventory',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'product_id' => 'required|exists:products,id',
                'stock_quantity' => 'required|integer|min:0',
            ]);

            $validatedData['status'] = $this->determineStatus($validatedData['stock_quantity']);

            $inventory = Inventory::create($validatedData);
            $inventory->load(['product.category', 'product.brand']);

            return response()->json(['data' => $inventory], 201);
        } catch (\Exception $e) {
            Log::error('Error storing inventory: ', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error creating inventory',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $inventory = Inventory::with(['product.category', 'product.brand'])
                ->whereNull('archive_at')
                ->find($id);

            if (!$inventory) {
                return response()->json(['message' => 'Inventory item not found'], 404);
            }

            return response()->json($inventory);
        } catch (\Exception $e) {
            Log::error('Error fetching inventory item: ', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error fetching inventory',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $inventory = Inventory::whereNull('archive_at')->find($id);

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
        } catch (\Exception $e) {
            Log::error('Error updating inventory: ', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error updating inventory',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $inventory = Inventory::whereNull('archive_at')->find($id);

            if (!$inventory) {
                return response()->json(['message' => 'Inventory item not found'], 404);
            }

            $inventory->delete(); // Soft delete using archive_at

            return response()->json(['message' => 'Inventory item archived successfully']);
        } catch (\Exception $e) {
            Log::error('Error archiving inventory: ', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error archiving inventory',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function restore($id)
    {
        try {
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
        } catch (\Exception $e) {
            Log::error('Error restoring inventory: ', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error restoring inventory',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function restock(Request $request, $id)
    {
        try {
            $inventory = Inventory::whereNull('archive_at')->find($id);

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
        } catch (\Exception $e) {
            Log::error('Error restocking inventory: ', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error restocking inventory',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getInventoryByProductId($id)
    {
        try {
            Log::info('Fetching inventory for product_id: ' . $id);
            $inventory = Inventory::where('product_id', $id)
                ->whereNull('archive_at')
                ->first();
            Log::info('Inventory result: ', [$inventory]);
            return $inventory 
                ? response()->json($inventory)
                : response()->json(['message' => 'Inventory not found for this product'], 404);
        } catch (\Exception $e) {
            Log::error('Error in getInventoryByProductId: ', [
                'product_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error fetching inventory',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function reduceStock(Request $request, $id)
    {
        try {
            $inventory = Inventory::whereNull('archive_at')->find($id);

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
        } catch (\Exception $e) {
            Log::error('Error reducing stock: ', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Error reducing stock',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}