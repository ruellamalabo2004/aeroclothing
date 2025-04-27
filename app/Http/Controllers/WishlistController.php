<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WishlistController extends Controller
{
    // Get wishlist items for the authenticated user
    public function index()
    {
        $wishlist = Wishlist::with('product')->where('user_id', Auth::id())->get();
        return response()->json($wishlist);
    }

    // Add a product to the wishlist
    // WishlistController.php
    public function store(Request $request)
    {
        // Validate that the user is authenticated and validate product_id
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',  // Validate product_id only, since user_id can be fetched from Auth
        ]);
    
        // Use the authenticated user's ID
        $userId = Auth::id();
        $productId = $validated['product_id'];
    
        // Check if item already exists
        $exists = Wishlist::where('user_id', $userId)
                         ->where('product_id', $productId)
                         ->exists();
    
        if ($exists) {
            return response()->json(['message' => 'Item already in wishlist'], 200);
        }
    
        // Create the wishlist entry
        $wishlist = Wishlist::create([
            'user_id' => $userId,
            'product_id' => $productId,
        ]);
    
        return response()->json($wishlist, 201);
    }
    
    // Remove a product from the wishlist
    public function destroy($productId)
    {
        $wishlist = Wishlist::where('user_id', Auth::id())->where('product_id', $productId)->first();
    
        if (!$wishlist) {
            return response()->json(['message' => 'Not found'], 404);
        }
    
        $wishlist->delete();
        return response()->json(['message' => 'Removed from wishlist']);
    }

    
}
