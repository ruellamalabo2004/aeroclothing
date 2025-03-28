<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderDetail;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index()
    {
        return response()->json(Order::with('orderDetails.product')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'profile_id' => 'required|exists:profiles,id',
            'payment_method' => 'required|string',
            'total_amount' => 'required|numeric',
            'date' => 'required|date',
            'status' => 'required|in:pending,processing,completed,cancelled',
            'order_details' => 'required|array',
            'order_details.*.product_id' => 'required|exists:products,id',
            'order_details.*.quantity' => 'required|integer|min:1'
        ]);

        $order = Order::create($request->only(['profile_id', 'payment_method', 'total_amount', 'date', 'status']));

        foreach ($request->order_details as $detail) {
            OrderDetail::create([
                'order_id' => $order->id,
                'product_id' => $detail['product_id'],
                'quantity' => $detail['quantity']
            ]);
        }

        return response()->json(['message' => 'Order created successfully', 'order' => $order]);
    }

    public function show($id)
    {
        $order = Order::with('orderDetails.product')->find($id);

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        return response()->json($order);
    }

    public function update(Request $request, $id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $order->update($request->only(['payment_method', 'total_amount', 'date', 'status']));

        return response()->json(['message' => 'Order updated successfully', 'order' => $order]);
    }

    public function destroy($id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $order->delete();
        return response()->json(['message' => 'Order archived successfully']);
    }

    public function restore($id)
    {
        $order = Order::onlyTrashed()->find($id);

        if (!$order) {
            return response()->json(['message' => 'Order not found in archive'], 404);
        }

        $order->restore();
        return response()->json(['message' => 'Order restored successfully']);
    }
}
