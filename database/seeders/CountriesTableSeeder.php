<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CountriesTableSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('countries')->insert([
            [
                'name' => 'Philippines',
                'iso_code' => 'PH',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'name' => 'United States',
                'iso_code' => 'US',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'name' => 'Canada',
                'iso_code' => 'CA',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'name' => 'Japan',
                'iso_code' => 'JP',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'name' => 'United Kingdom',
                'iso_code' => 'GB',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);
    }
}
