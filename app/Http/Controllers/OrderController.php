<?php

namespace App\Http\Controllers;

use App\Models\Order; // Fixed: Use correct model name
use Illuminate\Http\Request;

class OrderController extends Controller {
    public function index() {
        return response()->json(Order::all());
    }

    public function store(Request $request) {
        $order = Order::create($request->all());
        return response()->json($order, 201);
    }
   
    
    
    public function show($id) {
        return response()->json(Order::findOrFail($id));
    }

    public function update(Request $request, $id) {
        $order = Order::findOrFail($id);
        $order->update($request->all());
        return response()->json($order);
    }

    public function archive($id) {
        $order = Order::findOrFail($id);
        $order->update(['archive_at' => now()]);
        return response()->json(['message' => 'Order archived successfully']);
    }

    public function restore($id) {
        $order = Order::findOrFail($id);
        $order->update(['archive_at' => null]);
        return response()->json(['message' => 'Order restored successfully']);
    }
}