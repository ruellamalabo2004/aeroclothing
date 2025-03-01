<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index() {
        return response()->json(Product::all(), 200);
    }

    public function store(Request $request) {
        // Validate request data
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'category' => 'required|string|max:255',
            'productType' => 'required|string|max:255',
            'subProductType' => 'required|string|max:255',
            'quantity' => 'required|integer|min:0',
            'sizes' => 'required|array',
            'sizes.*' => 'string|max:50',  // Ensures each size is a valid string
            'paymentMethods' => 'required|array',
            'paymentMethods.*' => 'string|max:50',  // Ensures each method is valid
            'status' => 'required|in:Published,Archived',
            'image0' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'image1' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'image2' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'image3' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'image4' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Handle image uploads
        $images = [];
        for ($i = 0; $i <= 4; $i++) {
            if ($request->hasFile("image$i")) {
                $images[] = $request->file("image$i")->store('products', 'public');
            }
        }

        // Prepare data for creation
        $data = $request->except(['image0', 'image1', 'image2', 'image3', 'image4']);
        $data['images'] = json_encode($images);
        $data['sizes'] = json_encode($request->sizes);
        $data['paymentMethods'] = json_encode($request->paymentMethods);

        $product = Product::create($data);
        return response()->json($product, 201);
    }

    public function show($id) {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }
        return response()->json($product, 200);
    }

    public function update(Request $request, $id) {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        // Validate request data
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'price' => 'sometimes|required|numeric|min:0',
            'category' => 'sometimes|required|string|max:255',
            'productType' => 'sometimes|required|string|max:255',
            'subProductType' => 'sometimes|required|string|max:255',
            'quantity' => 'sometimes|required|integer|min:0',
            'sizes' => 'sometimes|required|array',
            'sizes.*' => 'string|max:50',
            'paymentMethods' => 'sometimes|required|array',
            'paymentMethods.*' => 'string|max:50',
            'status' => 'sometimes|required|in:Published,Archived',
            'image0' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'image1' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'image2' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'image3' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'image4' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Handle image updates
        $images = json_decode($product->images, true) ?? [];
        for ($i = 0; $i <= 4; $i++) {
            if ($request->hasFile("image$i")) {
                if (isset($images[$i]) && Storage::disk('public')->exists($images[$i])) {
                    Storage::disk('public')->delete($images[$i]);
                }
                $images[$i] = $request->file("image$i")->store('products', 'public');
            }
        }

        // Prepare data for update
        $data = $request->except(['image0', 'image1', 'image2', 'image3', 'image4']);
        $data['images'] = json_encode($images);
        $data['sizes'] = $request->sizes ? json_encode($request->sizes) : $product->sizes;
        $data['paymentMethods'] = $request->paymentMethods ? json_encode($request->paymentMethods) : $product->paymentMethods;

        $product->update($data);
        return response()->json($product, 200);
    }

    public function destroy($id) {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        // Delete associated images
        $images = json_decode($product->images, true);
        if ($images) {
            foreach ($images as $image) {
                if (Storage::disk('public')->exists($image)) {
                    Storage::disk('public')->delete($image);
                }
            }
        }

        $product->delete();
        return response()->json(['message' => 'Product deleted'], 200);
    }
}
