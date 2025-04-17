<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with(['category', 'brand'])->get();
        return response()->json($products);
    }

    public function show($id)
    {
        $product = Product::with(['category', 'brand'])->find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json($product);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'required|exists:brands,id',
            'product_name' => 'required|string|max:255',
            'product_type' => 'required|string|max:255',
            'colors' => 'required|string|max:255',
            'sizes' => 'required|string|max:255',
            'image_1' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'image_2' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'required|in:available,archived',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
        ]);

        // Handle file uploads
        if ($request->hasFile('image_1')) {
            $validated['image_1'] = $request->file('image_1')->store('products', 'public');
        }

        if ($request->hasFile('image_2')) {
            $validated['image_2'] = $request->file('image_2')->store('products', 'public');
        }

        $product = Product::create($validated);

        return response()->json($product, 201);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'required|exists:brands,id',
            'product_name' => 'required|string|max:255',
            'product_type' => 'required|string|max:255',
            'colors' => 'required|string|max:255',
            'sizes' => 'required|string|max:255',
            'image_1' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'image_2' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'required|in:available,archived',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
        ]);

        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        // Handle file uploads
        if ($request->hasFile('image_1')) {
            // Delete old image if exists
            if ($product->image_1) {
                Storage::disk('public')->delete($product->image_1);
            }
            $validated['image_1'] = $request->file('image_1')->store('products', 'public');
        }

        if ($request->hasFile('image_2')) {
            // Delete old image if exists
            if ($product->image_2) {
                Storage::disk('public')->delete($product->image_2);
            }
            $validated['image_2'] = $request->file('image_2')->store('products', 'public');
        }

        $product->update($validated);

        return response()->json($product);
    }

    public function destroy($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        // Delete associated images
        if ($product->image_1) {
            Storage::disk('public')->delete($product->image_1);
        }
        if ($product->image_2) {
            Storage::disk('public')->delete($product->image_2);
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }

    public function archive($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $product->update([
            'status' => 'archived',
            'deleted_at' => now(),
        ]);

        return response()->json(['message' => 'Product archived successfully']);
    }

    public function restore($id)
    {
        $product = Product::withTrashed()->find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $product->update([
            'status' => 'available',
            'deleted_at' => null,
        ]);

        return response()->json(['message' => 'Product restored successfully']);
    }
}