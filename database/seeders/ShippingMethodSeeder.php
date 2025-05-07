<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ShippingMethod;

class ShippingMethodSeeder extends Seeder
{
    public function run()
    {
        $methods = [
            [
                'name' => 'Standard Shipping',
                'description' => 'Estimated delivery in 5-7 business days',
                'fee' => 5.00
            ],
            [
                'name' => 'Express Shipping',
                'description' => 'Estimated delivery in 2-3 business days',
                'fee' => 10.00
            ],
            [
                'name' => 'Next Day Delivery',
                'description' => 'Delivery on the next business day',
                'fee' => 15.00
            ]
        ];

        foreach ($methods as $method) {
            ShippingMethod::create($method);
        }
    }
}

