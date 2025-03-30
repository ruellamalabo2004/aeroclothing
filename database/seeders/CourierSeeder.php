<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CourierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Sample data for the couriers table
        $couriers = [
            [
                'name' => 'J&T Express',
                'shipping_fee' => 80.00,
                'estimated_delivery_time' => '3-5 days',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'LBC',
                'shipping_fee' => 60.00,
                'estimated_delivery_time' => '1-2 days',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Ninja Van',
                'shipping_fee' => 45.00,
                'estimated_delivery_time' => '3-5 days',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Flash Express',
                'shipping_fee' => 55.00,
                'estimated_delivery_time' => '2-4 days',
                'is_active' => false, // Example of an inactive courier
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Insert the data into the couriers table
        DB::table('couriers')->insert($couriers);
    }
}