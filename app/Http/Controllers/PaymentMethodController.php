<?php

namespace App\Http\Controllers;

use App\Models\PaymentMethod;
use Illuminate\Http\Request;

class PaymentMethodController extends Controller
{
    public function index()
    {
        return PaymentMethod::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
        ]);

        return PaymentMethod::create($validated);
    }

    public function show($id)
    {
        return PaymentMethod::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $payment = PaymentMethod::findOrFail($id);
        $payment->update($request->only('name', 'description'));
        return $payment;
    }

    public function destroy($id)
    {
        PaymentMethod::destroy($id);
        return response()->noContent();
    }
}
