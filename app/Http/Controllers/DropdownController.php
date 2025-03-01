<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;

class DropdownController extends Controller
{
    public function getDropdowns()
    {
        return response()->json([
            'categories' => Category::all(['id', 'name']),
            'types' => ['Clothing', 'Electronics', 'Furniture'],
            'sub_types' => ['Shirt', 'Laptop', 'Table'],
            'statuses' => ['Published', 'Archived'],
            'payment_methods' => ['Cash', 'Credit Card', 'PayPal'],
            'sizes' => ['S', 'M', 'L', 'XL', 'XXL']
        ]);
    }
}

