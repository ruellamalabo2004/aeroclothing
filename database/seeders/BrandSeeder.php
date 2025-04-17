<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BrandSeeder extends Seeder
{
    public function run()
    {
        DB::table('brands')->insert([
            ['name' => 'Nike'],
            ['name' => 'Adidas'],
            ['name' => 'Puma'],
            ['name' => 'Reebok'],
            ['name' => 'Under Armour'],
            // Add more brands here
        ]);
    }
}
