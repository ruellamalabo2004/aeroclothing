<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    // Get all orders for the authenticated user
    public function index()
    {
        $orders = Order::where('user_id', Auth::id())->with('details')->get();
        return response()->json($orders);
    }

    // Place an order
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'shipping_id' => 'required|integer',
            'payment_method' => 'required|string',
            'cart_items' => 'required|array',
            'cart_items.*.product_id' => 'required|integer',
            'cart_items.*.quantity' => 'required|integer|min:1',
        ]);
    
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }
    
        $order = Order::create([
            'shipping_id' => $request->shipping_id,
            'payment_method' => $request->payment_method,
            'total_amount' => collect($request->cart_items)->sum(fn($item) => $item['quantity'] * 100), // Replace with real product prices
            'date' => now(),
            'status' => 'Pending',
        ]);
    
        foreach ($request->cart_items as $item) {
            OrderDetail::create([
                'order_id' => $order->id,
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
            ]);
        }
    
        return response()->json(['message' => 'Order placed successfully!', 'order' => $order]);
    }
    
    public function cart()
    {
        $cart = session('cart', []); // Assuming cart is stored in session
        return response()->json($cart);
    }
    
    // Get single order details
    public function show($id)
    {
        $order = Order::where('user_id', Auth::id())->with('details')->find($id);
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }
        return response()->json($order);
    }

    // Cancel an order
    public function destroy($id)
    {
        $order = Order::where('user_id', Auth::id())->find($id);
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $order->update(['status' => 'Canceled']);
        return response()->json(['message' => 'Order canceled']);
    }
}
