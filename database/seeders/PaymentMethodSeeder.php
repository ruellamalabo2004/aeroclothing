<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    public function run()
    {
        $paymentMethods = [
            ['name' => 'Credit Card', 'description' => 'Pay using Visa, MasterCard, or other major credit cards'],
            ['name' => 'PayPal', 'description' => 'Pay using PayPal'],
            ['name' => 'Bank Transfer', 'description' => 'Pay via bank transfer'],
            ['name' => 'Cash on Delivery', 'description' => 'Pay in cash when the order is delivered'],
        ];

        foreach ($paymentMethods as $method) {
            PaymentMethod::create($method);
        }
    }
}

