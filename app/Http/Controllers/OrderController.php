<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use App\Models\User;
use App\Models\Review;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class OrderController extends Controller
{
    // Show a list of all orders (admin)
    public function adminIndex(Request $request)
    {
        try {
            // Add more detailed logging to trace the issue
            \Log::info('Starting adminIndex method in OrderController');
            
            \Log::info('Attempting to fetch orders with profile relationships');
            
            // Use a query builder approach to avoid potential relationship issues
            $orders = Order::query()
                ->leftJoin('profiles', 'orders.profile_id', '=', 'profiles.id')
                ->leftJoin('payment_methods', 'orders.payment_method_id', '=', 'payment_methods.id')
                ->leftJoin('shipping_methods', 'orders.shipping_method_id', '=', 'shipping_methods.id')
                ->select(
                    'orders.*',
                    'profiles.first_name',
                    'profiles.last_name',
                    'profiles.user_id',
                    'payment_methods.name as payment_method_name',
                    'shipping_methods.name as shipping_method_name'
                )
                ->get();

            \Log::info('Orders retrieved:', ['count' => $orders->count()]);
            
            // Format the orders data safely
            $formattedOrders = $orders->map(function ($order) {
                try {
                    // Log individual order data to help debug
                    \Log::debug('Processing order:', [
                        'id' => $order->id,
                        'profile_id' => $order->profile_id,
                        'first_name' => $order->first_name,
                        'last_name' => $order->last_name
                    ]);
                    
                    return [
                        'id' => $order->id,
                        'profile_id' => $order->profile_id,
                        'profile' => [
                            'id' => $order->profile_id,
                            'name' => trim(($order->first_name ?? '') . ' ' . ($order->last_name ?? '')) ?: 'N/A',
                            'user_id' => $order->user_id ?? null
                        ],
                        'payment_method' => [
                            'id' => $order->payment_method_id,
                            'name' => $order->payment_method_name ?? 'N/A'
                        ],
                        'shipping_method' => [
                            'id' => $order->shipping_method_id,
                            'name' => $order->shipping_method_name ?? 'N/A'
                        ],
                        'total_amount' => $order->total_amount,
                        'order_date' => $order->order_date,
                        'status' => $order->status,
                        'tracking_info' => $order->tracking_info,
                        'created_at' => $order->created_at,
                        'updated_at' => $order->updated_at
                    ];
                } catch (\Exception $e) {
                    \Log::error('Error formatting order:', [
                        'order_id' => $order->id ?? 'unknown',
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
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
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    // Show orders for the authenticated user
    public function index(Request $request)
    {
        try {
            // Get the authenticated user's profile
            $profile = Profile::where('user_id', Auth::id())->first();
            
            if (!$profile) {
                \Log::error('Profile not found for user ID: ' . Auth::id());
                return response()->json(['message' => 'Profile not found'], 404);
            }

            \Log::info('Fetching orders for profile ID: ' . $profile->id);

            // Fetch orders for the user's profile
            $orders = Order::where('profile_id', $profile->id)
                ->with(['orderDetails.product', 'shippingMethod', 'paymentMethod'])
                ->orderBy('created_at', 'desc')
                ->get();

            \Log::info('Found ' . $orders->count() . ' orders for profile ID: ' . $profile->id);

            return response()->json($orders);
        } catch (\Exception $e) {
            \Log::error('Error fetching user orders: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['message' => 'Failed to fetch orders: ' . $e->getMessage()], 500);
        }
    }

    // Show a single order with details
    public function show($id)
    {
        $order = Order::with([
            'orderDetails.product',
            'shippingMethod',
            'paymentMethod',
            'profile.user'
        ])->findOrFail($id);
        
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
            'status' => 'required|string|in:Pending,Processing,Shipped,Delivering,Completed,Canceled,Returned',
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
        // Allow case-insensitive check for 'pending'
        if (strtolower($order->status) === 'pending') {
            $order->update(['status' => 'Canceled']);
            return response()->json(['message' => 'Order canceled successfully.']);
        }

        return response()->json(['message' => 'Order cannot be canceled. Only pending orders can be canceled.'], 400);
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
        
        // Validate the status against allowed values
        $allowedStatuses = ['Pending', 'Processing', 'Shipped', 'Delivering', 'Completed', 'Canceled', 'Returned'];
        if (!in_array($newStatus, $allowedStatuses)) {
            return response()->json([
                'message' => 'Invalid status value. Allowed values are: ' . implode(', ', $allowedStatuses)
            ], 422);
        }
        
        $order->update(['status' => $newStatus]);
        return response()->json($order);
    }

    // API endpoint to fetch transactions for admin
    public function transactions()
    {
        $orders = \App\Models\Order::with(['profile', 'paymentMethod'])
            ->orderBy('order_date', 'desc')
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'transaction_id' => 'ORD-' . str_pad($order->id, 5, '0', STR_PAD_LEFT),
                    'customer_name' => $order->profile ? trim(($order->profile->first_name ?? '') . ' ' . ($order->profile->last_name ?? '')) : 'N/A',
                    'amount' => $order->total_amount,
                    'payment_method' => $order->paymentMethod ? $order->paymentMethod->name : 'N/A',
                    'date' => $order->order_date,
                    'status' => $order->status,
                ];
            });

        return response()->json($orders);
    }

    // API endpoint for product sales report
    public function productSalesReport()
    {
        $products = \DB::table('order_details')
            ->join('products', 'order_details.product_id', '=', 'products.id')
            ->select(
                'products.id',
                'products.product_name',
                \DB::raw('SUM(order_details.quantity) as total_quantity'),
                \DB::raw('SUM(order_details.total) as total_sales')
            )
            ->groupBy('products.id', 'products.product_name')
            ->orderByDesc('total_sales')
            ->get();

        return response()->json($products);
    }
    
    // Mark an order as received by the customer
    public function markAsReceived($id)
    {
        try {
            $order = Order::findOrFail($id);
            
            // Ensure the order belongs to the authenticated user
            $profile = Profile::where('user_id', Auth::id())->first();
            if (!$profile || $order->profile_id !== $profile->id) {
                return response()->json(['message' => 'Unauthorized. This order does not belong to your account.'], 403);
            }
            
            // Check if the order status is 'Delivering'
            if ($order->status !== 'Delivering') {
                return response()->json(['message' => 'Only orders in Delivering status can be marked as received.'], 422);
            }
            
            // Update the order status
            $order->update(['status' => 'Completed']);
            
            return response()->json([
                'message' => 'Order marked as received successfully.',
                'order' => $order
            ]);
        } catch (\Exception $e) {
            \Log::error('Error marking order as received: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to mark order as received: ' . $e->getMessage()], 500);
        }
    }
    
    // Submit a rating for an order
    public function rateOrder(Request $request, $id)
    {
        try {
            $order = Order::findOrFail($id);
            
            // Validate the request data
            $request->validate([
                'rating' => 'required|integer|between:1,5',
                'feedback' => 'nullable|string',
                'product_id' => 'required|exists:products,id',
            ]);
            
            // Ensure the order belongs to the authenticated user
            $profile = Profile::where('user_id', Auth::id())->first();
            if (!$profile || $order->profile_id !== $profile->id) {
                return response()->json(['message' => 'Unauthorized. This order does not belong to your account.'], 403);
            }
            
            // Check if the order status is 'Completed'
            if ($order->status !== 'Completed') {
                return response()->json(['message' => 'Only completed orders can be rated.'], 422);
            }
            
            // Verify that the product is part of this order
            $orderDetail = $order->orderDetails()
                ->where('product_id', $request->product_id)
                ->first();
                
            if (!$orderDetail) {
                return response()->json(['message' => 'This product is not part of the specified order.'], 404);
            }
            
            // Check if this product has already been rated for this order
            $existingReview = Review::where([
                'user_id' => Auth::id(),
                'product_id' => $request->product_id,
                'order_id' => $order->id
            ])->first();
            
            // Prepare review text
            $reviewText = $request->feedback ?? 'Rated ' . $request->rating . ' stars';
            
            if ($existingReview) {
                // Update the existing review
                $existingReview->update([
                    'review' => $reviewText,
                    'rating' => $request->rating
                ]);
                
                return response()->json([
                    'message' => 'Product rating updated successfully.',
                    'review' => $existingReview
                ]);
            }
            
            // Create a new review for the product
            $review = Review::create([
                'user_id' => Auth::id(),
                'product_id' => $request->product_id,
                'order_id' => $order->id,
                'review' => $reviewText,
                'rating' => $request->rating,
            ]);
            
            return response()->json([
                'message' => 'Product rated successfully.',
                'review' => $review
            ]);
        } catch (\Exception $e) {
            \Log::error('Error rating product: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to rate product: ' . $e->getMessage()], 500);
        }
    }
}