<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ProductTypeSeeder extends Seeder
{
    public function run()
    {
        $types = ['Tops', 'Bottoms', 'Jacket', 'Swimwear'];

        foreach ($types as $type) {
            DB::table('product_types')->insert([
                'type_name' => $type,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ]);
        }
    }
}
