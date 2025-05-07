<?php

namespace App\Http\Controllers;

use App\Models\OrderDetail;
use Illuminate\Http\Request;

class OrderDetailController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'product_id' => 'required|exists:products,id',
            'size' => 'required|string', // Validate size
            'color' => 'required|string', // Validate color
            'quantity' => 'required|integer|min:1',
            'price' => 'required|numeric',
            'total' => 'required|numeric',
        ]);

        $orderDetail = OrderDetail::create([
            'order_id' => $request->order_id,
            'product_id' => $request->product_id,
            'size' => $request->size,
            'color' => $request->color,
            'quantity' => $request->quantity,
            'price' => $request->price,
            'total' => $request->total,
        ]);

        return response()->json(['message' => 'Order detail added successfully', 'data' => $orderDetail]);
    }

    // Add other methods for CRUD operations (show, update, destroy) as needed
}
