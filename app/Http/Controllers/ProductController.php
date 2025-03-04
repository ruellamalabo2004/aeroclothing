<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index()
    {
        // Fetch all products (not just available ones, since frontend filters them)
        $products = Product::all();

        // Return relative image paths instead of full URLs
        $products->transform(function ($product) {
            return $product; // No transformation needed; image_1 is already relative
        });

        return response()->json($products);
    }

    public function show($id)
    {
        $product = Product::findOrFail($id);
        return response()->json($product); // Return relative path as stored
    }

    public function store(Request $request)
    {
        $request->validate([
            'category' => 'required|string',
            'product_name' => 'required|string',
            'product_type' => 'required|string',
            'brand' => 'required|string',
            'sizes' => 'required|json',
            'colors' => 'required|json',
            'price' => 'required|numeric',
            'description' => 'nullable|string',
            'image_1' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'required|in:available,archived',
        ]);

        // Handle image upload
        $imagePath = $request->hasFile('image_1')
            ? $request->file('image_1')->store('product_images', 'public')
            : null;

        $product = Product::create([
            'category' => $request->category,
            'product_name' => $request->product_name,
            'product_type' => $request->product_type,
            'brand' => $request->brand,
            'sizes' => json_decode($request->sizes, true),
            'colors' => json_decode($request->colors, true),
            'price' => $request->price,
            'description' => $request->description,
            'image_1' => $imagePath, // Store relative path (e.g., "product_images/filename.png")
            'status' => $request->status,
        ]);

        return response()->json($product, 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'category' => 'sometimes|string',
            'product_name' => 'sometimes|string',
            'product_type' => 'sometimes|string',
            'brand' => 'sometimes|string',
            'sizes' => 'sometimes|json',
            'colors' => 'sometimes|json',
            'price' => 'sometimes|numeric',
            'description' => 'sometimes|string',
            'image_1' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'sometimes|in:available,archived',
        ]);

        // Handle new image upload
        if ($request->hasFile('image_1')) {
            // Delete old image if it exists
            if ($product->image_1) {
                Storage::disk('public')->delete($product->image_1);
            }
            $imagePath = $request->file('image_1')->store('product_images', 'public');
            $product->image_1 = $imagePath; // Store relative path
        }

        $product->update([
            'category' => $request->category ?? $product->category,
            'product_name' => $request->product_name ?? $product->product_name,
            'product_type' => $request->product_type ?? $product->product_type,
            'brand' => $request->brand ?? $product->brand,
            'sizes' => $request->has('sizes') ? json_decode($request->sizes, true) : $product->sizes,
            'colors' => $request->has('colors') ? json_decode($request->colors, true) : $product->colors,
            'price' => $request->price ?? $product->price,
            'description' => $request->description ?? $product->description,
            'status' => $request->status ?? $product->status,
        ]);

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