<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\OrderTracking;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    // List all orders with details and tracking info.
    public function index()
    {
        $orders = Order::with(['details', 'tracking'])->get();
        return response()->json($orders);
    }

    // Create a new order, including order details and an initial tracking record.
    public function store(Request $request)
    {
        $validated = $request->validate([
            'profile_id'     => 'required|exists:profiles,id',
            'payment_method' => 'required|string|max:50',
            'total_amount'   => 'required|numeric',
            'order_date'     => 'nullable|date',
            'details'        => 'required|array',
            'details.*.product_id' => 'required|exists:products,id',
            'details.*.quantity'   => 'required|integer|min:1',
        ]);

        // Create order.
        $order = Order::create([
            'profile_id'     => $validated['profile_id'],
            'payment_method' => $validated['payment_method'],
            'total_amount'   => $validated['total_amount'],
            'order_date'     => $validated['order_date'] ?? now(),
            'status'         => 'PENDING',
        ]);

        // Create each order detail.
        foreach ($validated['details'] as $detail) {
            $order->details()->create($detail);
        }

        // Create initial tracking record.
        OrderTracking::create([
            'order_id' => $order->id,
            'status'   => $order->status,
        ]);

        return response()->json($order->load(['details', 'tracking']), 201);
    }

    // Show a specific order with its details and tracking info.
    public function show($id)
    {
        $order = Order::with(['details', 'tracking'])->findOrFail($id);
        return response()->json($order);
    }

    // Update an order. If status changes, record the new status in order tracking.
    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'payment_method' => 'sometimes|string|max:50',
            'total_amount'   => 'sometimes|numeric',
            'order_date'     => 'sometimes|date',
            'status'         => 'sometimes|in:PENDING,PROCESSING,SHIPPING,DELIVERED,RETURNED,CANCELED',
        ]);

        $order->update($validated);

        // If the status was updated, add a new tracking record.
        if (isset($validated['status'])) {
            OrderTracking::create([
                'order_id' => $order->id,
                'status'   => $validated['status'],
            ]);
        }

        return response()->json($order->load(['details', 'tracking']));
    }

    // Delete an order (this will also remove its details and tracking records thanks to foreign key cascade).
    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        $order->delete();

        return response()->json(null, 204);
    }

    // Track the status of an order (e.g., to update the status)
    public function trackOrder(Request $request, $orderId)
    {
        $validated = $request->validate([
            'status' => 'required|in:PENDING,PROCESSING,SHIPPING,DELIVERED,RETURNED,CANCELED',
        ]);

        $order = Order::findOrFail($orderId);
        OrderTracking::create([
            'order_id' => $order->id,
            'status'   => $validated['status'],
        ]);

        return response()->json(['message' => 'Order status updated successfully']);
    }

    // Get the tracking status of an order
    public function getTrackingStatus($orderId)
    {
        $order = Order::with('tracking')->findOrFail($orderId);
        return response()->json($order->tracking);
    }
}
