<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index()
    {
        // Fetch all products with category and brand
        $products = Product::with(['category', 'brand'])->get();
        return response()->json($products);
    }

    public function show($id)
    {
        $product = Product::with(['category', 'brand'])->findOrFail($id);
        return response()->json($product);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'required|exists:brands,id',
            'product_name' => 'required|string|max:255',
            'product_type' => 'required|string',
            'sizes' => 'required|array',
            'colors' => 'required|array',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'image_1' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'required|in:available,archived',
        ]);

        // Handle Image Upload
        $imagePath = $request->hasFile('image_1')
            ? $request->file('image_1')->store('product_images', 'public')
            : null;

        $product = Product::create([
            'category_id' => $request->category_id,
            'brand_id' => $request->brand_id,
            'product_name' => $request->product_name,
            'product_type' => $request->product_type,
            'sizes' => $request->sizes,
            'colors' => $request->colors,
            'price' => $request->price,
            'description' => $request->description,
            'image_1' => $imagePath,
            'status' => $request->status,
        ]);

        // Load relationships after creation
        $product->load(['category', 'brand']);

        return response()->json($product, 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'brand_id' => 'sometimes|exists:brands,id',
            'product_name' => 'sometimes|string|max:255',
            'product_type' => 'sometimes|string',
            'sizes' => 'sometimes|array',
            'colors' => 'sometimes|array',
            'price' => 'sometimes|numeric|min:0',
            'description' => 'sometimes|string',
            'image_1' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'sometimes|in:available,archived',
        ]);

        // Handle Image Upload
        if ($request->hasFile('image_1')) {
            if ($product->image_1) {
                Storage::disk('public')->delete($product->image_1);
            }
            $imagePath = $request->file('image_1')->store('product_images', 'public');
            $product->image_1 = $imagePath;
        }
        $product->update($request->except('image_1'));

        // Load relationships after update
        $product->load(['category', 'brand']);

        return response()->json($product);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->update(['status' => 'archived']);
        return response()->json(['message' => 'Product archived']);
    }

    public function restore($id)
    {
        $product = Product::findOrFail($id);
        $product->update(['status' => 'available']);
        return response()->json(['message' => 'Product restored']);
    }
}