<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\OrderTracking;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller 
{
    public function index() {
        $orders = Order::with('orderDetails.product', 'profile', 'courier')->get();
        return response()->json($orders);
    }
    
    private function getPastTenseStatus($status) {
        $statusMap = [
            'PENDING' => 'Placed',
            'PROCESSING' => 'Processed',
            'SHIPPING' => 'Shipped',
            'DELIVERED' => 'Delivered',
            'CANCELED' => 'Canceled',
            'RETURNED' => 'Returned'
        ];
    
        return $statusMap[$status] ?? $status; // Default to same status if not found
    }
    
    public function store(Request $request) {
        $validatedData = $request->validate([
            'profile_id' => 'required|exists:profiles,id',
            'courier_id' => 'required|exists:couriers,id', // Ensure courier_id is valid
            'payment_method' => 'required|string',
            'total_amount' => 'required|numeric',
            'order_details' => 'required|array',
            'order_details.*.product_id' => 'required|exists:products,id',
            'order_details.*.quantity' => 'required|integer|min:1'
        ]);
    
        DB::beginTransaction();
        try {
            $order = Order::create([
                'profile_id' => $request->profile_id,
                'courier_id' => $request->courier_id, // Store the courier
                'payment_method' => $request->payment_method,
                'total_amount' => $request->total_amount,
                'order_date' => now(),
                'status' => 'PENDING'
            ]);
    
            foreach ($request->order_details as $detail) {
                OrderDetail::create([
                    'order_id' => $order->id,
                    'product_id' => $detail['product_id'],
                    'quantity' => $detail['quantity']
                ]);
            }
    
            OrderTracking::create([
                'order_id' => $order->id,
                'status' => 'PENDING',
                'created_at' => now(),
            ]);
    
            // Get user_id from profiles table
            $userId = \App\Models\Profile::where('id', $request->profile_id)->value('user_id');
    
            $firstProductId = $request->order_details[0]['product_id'];
            $product = \App\Models\Product::find($firstProductId);
            $imagePath = $product->image_1 ?? null;
    
            $imageUrl = $imagePath && !str_contains($imagePath, 'http')
                ? asset('storage/' . $imagePath)
                : $imagePath;
    
            Notification::create([
                'user_id' => $userId,
                'order_id' => $order->id,
                'status' => 'Placed',
                'product_image' => $imageUrl, 
                'created_at' => now(),
                'updated_at' => now(),
            ]);
    
            DB::commit();
            return response()->json([
                'message' => 'Order placed successfully',
                'order' => $order,
                'order_id' => $order->id
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to place order', 'error' => $e->getMessage()], 500);
        }
    }
    

    public function show($id)
    {
        $order = Order::with('orderDetails.product', 'trackings', 'profile', 'courier')->find($id);
    
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }
    
        return response()->json([
            'id' => $order->id,
            'status' => $order->status,
            'total_amount' => $order->total_amount,
            'customer' => $order->profile->first_name . ' ' . $order->profile->last_name,
            'payment_method' => $order->payment_method,
            'created_at' => $order->created_at,
            'courier' => [
                'id' => $order->courier->id,
                'name' => $order->courier->name,
                'shipping_fee' => $order->courier->shipping_fee,
                'estimated_delivery_time' => $order->courier->estimated_delivery_time,
            ],
            'products' => $order->orderDetails->map(function ($detail) {
                $imagePath = $detail->product->image_1;
                return [
                    'id' => $detail->product->id,
                    'product_name' => $detail->product->product_name,
                    'price' => $detail->product->price,
                    'quantity' => $detail->quantity,
                    'image_1' => $imagePath && !str_contains($imagePath, 'http')
                        ? asset('storage/' . $imagePath)
                        : $imagePath,
                ];
            }),
            'tracking_history' => $order->trackings->map(function ($tracking) {
                return [
                    'status' => $tracking->status,
                    'timestamp' => $tracking->created_at->toDateTimeString(),
                    'remarks' => $tracking->remarks,
                ];
            }),
        ]);
    }


  public function update(Request $request, $id) {
    $order = Order::with('orderDetails.product')->findOrFail($id);
    
    $validated = $request->validate([
        'status' => 'sometimes|string|in:PENDING,PROCESSING,SHIPPING,DELIVERED,CANCELED,RETURNED',
        'payment_method' => 'sometimes|string',
        'total_amount' => 'sometimes|numeric',
        'courier_id' => 'sometimes|exists:couriers,id', // Allow updating courier_id
    ]);

    DB::beginTransaction();
    try {
        if ($request->has('status') && $request->status !== $order->status) {
            OrderTracking::create([
                'order_id' => $order->id,
                'status' => $request->status,
                'created_at' => now(),
            ]);

            $firstProductImage = $order->orderDetails->first()->product->image_1 ?? null;
            $imageUrl = $firstProductImage && !str_contains($firstProductImage, 'http')
                ? asset('storage/' . $firstProductImage)
                : $firstProductImage;

            $pastTenseStatus = $this->getPastTenseStatus($request->status);

            Notification::create([
                'user_id' => $order->profile->user_id,
                'order_id' => $order->id,
                'status' => $pastTenseStatus,
                'product_image' => $imageUrl,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $order->update($validated);
        DB::commit();
        return response()->json($order);
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json(['message' => 'Failed to update order', 'error' => $e->getMessage()], 500);
    }
}


    public function updateOrderStatus($orderId, $newStatus)
    {
        $order = Order::with('orderDetails.product')->findOrFail($orderId);
        $order->update(['status' => $newStatus]);

        $userId = $order->profile->user_id;
        $firstProductImage = $order->orderDetails->first()->product->image_1 ?? null;

        // ✅ Fix: Convert to full image URL if necessary
        $imageUrl = $firstProductImage && !str_contains($firstProductImage, 'http')
            ? asset('storage/' . $firstProductImage)
            : $firstProductImage;

        $notification = Notification::where('order_id', $orderId)
            ->where('status', $newStatus)
            ->first();

        if ($notification) {
            $notification->update(['product_image' => $imageUrl]);
        } else {
          // Convert status to past tense
$pastTenseStatus = $this->getPastTenseStatus($newStatus);

Notification::create([
    'user_id' => $userId,
    'order_id' => $orderId,
    'status' => $pastTenseStatus, // ✅ Now using past tense
    'product_image' => $imageUrl,
]);

        }

        return response()->json(['message' => 'Order updated and notification processed'], 200);
    }

    public function archive($id) {
        $order = Order::findOrFail($id);
        $order->update(['archived_at' => now()]);
        return response()->json(['message' => 'Order archived successfully']);
    }

    public function restore($id) {
        $order = Order::findOrFail($id);
        $order->update(['archived_at' => null]);
        return response()->json(['message' => 'Order restored successfully']);
    }
}
