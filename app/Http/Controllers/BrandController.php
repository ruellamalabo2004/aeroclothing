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

    // Delete a brand
    public function destroy($id)
    {
        $brand = Brand::find($id);

        if (!$brand) {
            return response()->json(['message' => 'Brand not found'], 404);
        }

        $brand->delete();

        return response()->json(['message' => 'Brand deleted'], 200);
    }
}
