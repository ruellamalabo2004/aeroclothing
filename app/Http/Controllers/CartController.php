<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    // Get all cart items for the logged-in user
  
// Get all cart items for the logged-in user
public function getCart()
{
    $user = Auth::user();
    $cart = Cart::where('user_id', $user->id)
        ->with('product')
        ->get()
        ->map(function ($item) {
            // Create a processed item with all required fields
            $processedItem = $item->toArray();
            
            // Add name and image fields to product
            if ($item->product) {
                $processedItem['product']['name'] = $item->product->product_name;
                $processedItem['product']['image'] = $item->product->image_1;
            }
            
            // Ensure size and color are explicitly included
            $processedItem['size'] = $item->size;
            $processedItem['color'] = $item->color;
            
            return $processedItem;
        });

    return response()->json($cart);
}
    
    

    // Add product to cart
    public function addToCart(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'color' => 'nullable|string',
            'size' => 'nullable|string',
        ]);

        $user = Auth::user();

        // Check if product is already in cart
        $cartItem = Cart::where('user_id', $user->id)
                        ->where('product_id', $request->product_id)
                        ->where('color', $request->color)
                        ->where('size', $request->size)
                        ->first();

        if ($cartItem) {
            // Set the quantity instead of incrementing
            $cartItem->quantity = $request->quantity;
            $cartItem->save();
        } else {
            Cart::create([
                'user_id' => $user->id,
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
                'color' => $request->color,
                'size' => $request->size,
            ]);
        }

        return response()->json(['message' => 'Product added to cart']);
    }

    // Remove a single item from the cart
    public function removeFromCart($productId, $size = null, $color = null)
    {
        $user = Auth::user();

        $cartItemQuery = Cart::where('user_id', $user->id)->where('product_id', $productId);

        if ($size) {
            $cartItemQuery->where('size', $size);
        }
        if ($color) {
            $cartItemQuery->where('color', $color);
        }

        $cartItem = $cartItemQuery->first();

        if (!$cartItem) {
            return response()->json(['message' => 'Cart item not found'], 404);
        }

        $cartItem->delete();
        return response()->json(['message' => 'Item removed from cart']);
    }

    // Update quantity in cart
    public function updateCart(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer',
            'color' => 'nullable|string',
            'size' => 'nullable|string',
        ]);

        $user = Auth::user();

        $cartItem = Cart::where('user_id', $user->id)
                        ->where('product_id', $request->product_id)
                        ->where('color', $request->color)
                        ->where('size', $request->size)
                        ->first();

                        if ($request->quantity <= 0) {
                            $cartItem->delete();
                            return response()->json(['message' => 'Item removed from cart']);
                        }
                        $cartItem->quantity = $request->quantity;
                        $cartItem->save();
                        

        return response()->json(['message' => 'Cart updated', 'item' => $cartItem]);
    }

    // Clear entire cart for logged-in user
    public function clearCart()
    {
        $user = Auth::user();
        Cart::where('user_id', $user->id)->delete();
        return response()->json(['message' => 'Cart cleared']);
    }
}
