<?php

namespace App\Http\Controllers;

use App\Models\ProductType;
use Illuminate\Http\Request;

class ProductTypeController extends Controller
{
    public function index()
    {
        $productTypes = ProductType::all();
        return response()->json($productTypes);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:product_types',
        ]);

        $productType = ProductType::create($validated);
        return response()->json($productType, 201);
    }

    public function show(ProductType $productType)
    {
        return response()->json($productType);
    }

    public function update(Request $request, ProductType $productType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:product_types,name,' . $productType->id,
        ]);

        $productType->update($validated);
        return response()->json($productType);
    }

    public function destroy(ProductType $productType)
    {
        $productType->delete();
        return response()->json(['message' => 'Product type archived successfully']);
    }

    public function restore($id)
    {
        $productType = ProductType::onlyTrashed()->findOrFail($id);
        $productType->restore();
        return response()->json(['message' => 'Product type restored successfully']);
    }
}