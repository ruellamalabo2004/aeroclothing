<?php

namespace App\Http\Controllers;

use App\Models\OrderTracking;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderTrackingController extends Controller
{
    // Get tracking history for a specific order
    public function index($orderId)
    {
        $trackings = OrderTracking::where('order_id', $orderId)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($trackings);
    }

    // Get full tracking details with timestamps for order tracking page
    public function getOrderTracking($orderId)
    {
        // Check if order exists
        $order = Order::findOrFail($orderId);
        
        // Get all tracking updates for this order
        $trackings = OrderTracking::where('order_id', $orderId)
            ->orderBy('created_at', 'asc')
            ->get();
            
        // Format timestamps for proper display
        $trackings->transform(function ($tracking) {
            $tracking->formatted_date = $tracking->created_at->format('M d, Y, h:i A');
            return $tracking;
        });

        return response()->json($trackings);
    }

    // Add a new tracking status update
    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'status' => 'required|string',
            'note' => 'nullable|string',
        ]);

        $tracking = OrderTracking::create($validated);

        // Update the order status too
        $order = Order::find($validated['order_id']);
        if ($order) {
            $order->status = $validated['status'];
            $order->save();
        }

        return response()->json([
            'message' => 'Tracking status added successfully.',
            'tracking' => $tracking,
        ], 201);
    }
}
