<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $notifications = Notification::where('user_id', $user->id)
            ->with(['order.orderDetails.product' => function ($query) {
                $query->select('id', 'image_1');
            }])
            ->orderBy('created_at', 'desc')
            ->get(['id', 'order_id', 'status', 'created_at', 'product_image']);
    
        $baseImageUrl = env('APP_URL') . '/storage/';
    
        $notifications = $notifications->map(function ($notification) use ($baseImageUrl) {
            if ($notification->product_image) {
                // If already a full URL, use it as is; otherwise, prepend base URL
                $notification->product_image = str_contains($notification->product_image, 'http')
                    ? $notification->product_image
                    : $baseImageUrl . $notification->product_image;
            } elseif ($notification->order && $notification->order->orderDetails->isNotEmpty()) {
                $firstProduct = $notification->order->orderDetails->first()->product;
                $notification->product_image = $firstProduct && $firstProduct->image_1
                    ? $baseImageUrl . $firstProduct->image_1
                    : null;
            }
            return $notification;
        });
    
        return response()->json(['data' => $notifications], 200);
    }
}