<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use App\Models\User;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    // Show a list of all orders (admin)
    public function adminIndex(Request $request)
    {
        try {
            // First, let's check if we can get any orders at all
            $orders = Order::with([
                'profile:id,first_name,last_name,email',
                'paymentMethod:id,name',
                'shippingMethod:id,name',
                'orderDetails.product:id,name,price'
            ])->get();

            \Log::info('Orders retrieved:', ['count' => $orders->count()]);
            
            // Format the orders data to include the full name
            $formattedOrders = $orders->map(function ($order) {
                try {
                    $orderData = $order->toArray();
                    
                    // Safely handle profile data
                    if ($order->profile) {
                        $firstName = $order->profile->first_name ?? '';
                        $lastName = $order->profile->last_name ?? '';
                        $orderData['profile']['name'] = trim($firstName . ' ' . $lastName);
                    } else {
                        $orderData['profile'] = ['name' => 'N/A'];
                    }

                    // Safely handle payment method
                    if (!$order->paymentMethod) {
                        $orderData['payment_method'] = ['name' => 'N/A'];
                    }

                    // Safely handle shipping method
                    if (!$order->shippingMethod) {
                        $orderData['shipping_method'] = ['name' => 'N/A'];
                    }

                    return $orderData;
                } catch (\Exception $e) {
                    \Log::error('Error formatting order:', [
                        'order_id' => $order->id,
                        'error' => $e->getMessage()
                    ]);
                    return null;
                }
            })->filter(); // Remove any null entries from failed formatting
            
            return response()->json($formattedOrders);
        } catch (\Exception $e) {
            \Log::error('Error in adminIndex: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'message' => 'An error occurred while fetching orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Show orders for the authenticated user
    public function index(Request $request)
    {
        $orders = Order::where('profile_id', Auth::id()) // Fetch orders for the authenticated user
            ->with('orderDetails.product') // Eager load order details with product
            ->get();
        return response()->json($orders);
    }

    // Show a single order with details
    public function show($id)
    {
        $order = Order::with('orderDetails.product')->findOrFail($id);
        return response()->json($order);
    }

    // Create a new order
    public function store(Request $request)
    {
        $request->validate([
            'profile_id' => 'required|exists:profiles,id',
            'shipping_method_id' => 'required|exists:shipping_methods,id',
            'payment_method_id' => 'required|exists:payment_methods,id',
            'total_amount' => 'required|numeric|min:0',
            'order_details' => 'required|array|min:1',
            'order_details.*.product_id' => 'required|exists:products,id',
            'order_details.*.quantity' => 'required|integer|min:1',
            'order_details.*.price' => 'required|numeric|min:0',
            'order_details.*.size' => 'required|string|max:50',
            'order_details.*.color' => 'required|string|max:50',
        ]);

        try {
            DB::beginTransaction();

            $order = Order::create([
                'profile_id' => $request->profile_id,
                'shipping_method_id' => $request->shipping_method_id,
                'payment_method_id' => $request->payment_method_id,
                'total_amount' => $request->total_amount,
                'order_date' => now(),
                'status' => 'PENDING',
            ]);

            foreach ($request->order_details as $detail) {
                $total = $detail['quantity'] * $detail['price'];
                $order->orderDetails()->create([
                    'product_id' => $detail['product_id'],
                    'quantity' => $detail['quantity'],
                    'price' => $detail['price'],
                    'total' => $total,
                    'size' => $detail['size'],
                    'color' => $detail['color'],
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Order created successfully',
                'order_id' => $order->id,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Update an existing order (only status can be updated)
    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $request->validate([
            'status' => 'required|string|in:PENDING,PROCESSING,SHIPPING,DELIVERED,CANCELLED',
        ]);
        $order->update($request->only('status'));

        return response()->json($order);
    }

    // Archive an order (soft delete)
    public function archive($id)
    {
        $order = Order::findOrFail($id);
        $order->delete(); // Soft delete the order

        return response()->json(['message' => 'Order archived successfully.']);
    }

    // Restore an archived order
    public function restore($id)
    {
        $order = Order::withTrashed()->findOrFail($id);
        $order->restore();

        return response()->json(['message' => 'Order restored successfully.']);
    }

    // Track an order's status
    public function trackOrder($id)
    {
        $order = Order::findOrFail($id);
        return response()->json([
            'order_id' => $order->id,
            'status' => $order->status,
            'tracking_info' => $order->tracking_info,
        ]);
    }

    // Get the tracking status of an order
    public function getTrackingStatus($id)
    {
        $order = Order::findOrFail($id);
        return response()->json([
            'tracking_status' => $order->status,
        ]);
    }

    // Cancel an order
    public function cancel($id)
    {
        $order = Order::findOrFail($id);
        
        if ($order->status == 'PENDING') {
            $order->update(['status' => 'CANCELLED']);
            return response()->json(['message' => 'Order cancelled successfully.']);
        }

        return response()->json(['message' => 'Order cannot be cancelled'], 400);
    }

    // Submit a review for an order detail
    public function submitReview(Request $request, $orderId, $orderDetailId)
    {
        $request->validate([
            'rating' => 'required|integer|between:1,5',
            'review' => 'required|string|max:255',
        ]);

        $orderDetail = OrderDetail::findOrFail($orderDetailId);

        // Ensure the order belongs to the authenticated user
        if ($orderDetail->order->profile_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Create the review
        $review = Review::create([
            'user_id' => Auth::id(),
            'product_id' => $orderDetail->product_id,
            'rating' => $request->rating,
            'review' => $request->review,
        ]);

        return response()->json($review, 201);
    }

    // Update order status (admin can update any order status)
    public function updateOrderStatus($orderId, $newStatus)
    {
        $order = Order::findOrFail($orderId);
        $order->update(['status' => $newStatus]);

        return response()->json($order);
    }
}