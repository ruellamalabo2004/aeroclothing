<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    // Get all brands
    public function index()
    {
        return response()->json(Brand::all(), 200);
    }

    // Store a new brand
    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|unique:brands']);

        $brand = Brand::create(['name' => $request->name]);

        return response()->json($brand, 201);
    }

    // Get a specific brand
    public function show($id)
    {
        $brand = Brand::find($id);

        if (!$brand) {
            return response()->json(['message' => 'Brand not found'], 404);
        }

        return response()->json($brand, 200);
    }

    // Update a brand
    public function update(Request $request, $id)
    {
        $brand = Brand::find($id);

        if (!$brand) {
            return response()->json(['message' => 'Brand not found'], 404);
        }

        $request->validate(['name' => 'required|string|unique:brands,name,' . $id]);

        $brand->update(['name' => $request->name]);

        return response()->json($brand, 200);
    }

    // Delete a brand (soft delete)
    public function destroy($id)
    {
        $brand = Brand::find($id);

        if (!$brand) {
            return response()->json(['message' => 'Brand not found'], 404);
        }

        $brand->delete();

        return response()->json(['message' => 'Brand deleted'], 200);
    }

    // Archive a brand
    public function archive($id)
    {
        $brand = Brand::find($id);

        if (!$brand) {
            return response()->json(['message' => 'Brand not found'], 404);
        }

        // Check if brand is already archived
        if ($brand->status === 'archived') {
            return response()->json(['message' => 'Brand is already archived'], 400);
        }

        // Update the status and archived_at fields
        $brand->status = 'archived';
        $brand->archived_at = now();  // Set the archived time
        $brand->save();

        return response()->json(['message' => 'Brand archived successfully', 'brand' => $brand]);
    }

    // Restore a brand
    public function restore($id)
    {
        $brand = Brand::find($id);

        if (!$brand) {
            return response()->json(['message' => 'Brand not found'], 404);
        }

        if ($brand->status !== 'archived') {
            return response()->json(['message' => 'Brand is not archived'], 400);
        }

        // Restore the brand (remove archived status)
        $brand->status = 'active';
        $brand->archived_at = null;  // Reset archived_at
        $brand->save();

        return response()->json(['message' => 'Brand restored successfully', 'brand' => $brand]);
    }
}
