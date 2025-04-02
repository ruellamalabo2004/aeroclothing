<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    // Get all cart items for the logged-in user
    public function getCart()
    {
        $user = Auth::user();
        $cart = Cart::where('user_id', $user->id)->with('product')->get();
        return response()->json($cart);
    }

    // Add product to cart
    public function addToCart(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'color' => 'nullable|string', // Validation for color
            'size' => 'nullable|string',  // Validation for size
        ]);

        $user = Auth::user();

        // Check if product is already in cart
        $cartItem = Cart::where('user_id', $user->id)
                        ->where('product_id', $request->product_id)
                        ->where('color', $request->color)  // Check for existing color
                        ->where('size', $request->size)    // Check for existing size
                        ->first();

        if ($cartItem) {
            // If the item exists in the cart, increment the quantity
            $cartItem->increment('quantity', $request->quantity);
        } else {
            // If the item doesn't exist, add it to the cart
            Cart::create([
                'user_id' => $user->id,
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
                'color' => $request->color,  // Store the selected color
                'size' => $request->size,    // Store the selected size
            ]);
        }

        return response()->json(['message' => 'Product added to cart']);
    }

    // Remove a single item from the cart
    public function removeFromCart($productId)
    {
        $user = Auth::user();

        // Find the cart item based on user_id and product_id
        $cartItem = Cart::where('user_id', $user->id)->where('product_id', $productId)->first();

        if (!$cartItem) {
            return response()->json(['message' => 'Cart item not found'], 404);
        }

        $cartItem->delete();
        return response()->json(['message' => 'Item removed from cart']);
    }

    // Clear the entire cart for the logged-in user
    public function clearCart()
    {
        $user = Auth::user();
        Cart::where('user_id', $user->id)->delete();
        return response()->json(['message' => 'Cart cleared']);
    }
}
