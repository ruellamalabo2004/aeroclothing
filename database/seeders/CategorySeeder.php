<?php

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = ['Mens', 'Womens', 'Girls', 'Boys'];

        foreach ($categories as $category) {
            Category::create(['name' => $category]);
        }
    }
}

