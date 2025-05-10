<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function getStatistics()
    {
        try {
            // Get total orders
            $totalOrders = Order::count();
            
            // Get total revenue
            $totalRevenue = Order::where('status', '!=', 'Canceled')
                ->sum('total_amount');
            
            // Get total products
            $totalProducts = Product::count();
            
            // Get total users
            $totalUsers = User::count();
            
            // Get monthly sales data with all months
            $monthlySales = collect(range(1, 12))->map(function ($month) {
                $sales = Order::where('status', '!=', 'Canceled')
                    ->whereYear('created_at', date('Y'))
                    ->whereMonth('created_at', $month)
                    ->sum('total_amount');

                return [
                    'month' => date('M', mktime(0, 0, 0, $month, 1)),
                    'total' => $sales
                ];
            });

            // Get top selling products
            $topSellingProducts = DB::table('order_details')
                ->join('products', 'order_details.product_id', '=', 'products.id')
                ->select(
                    'products.product_name as name',
                    'products.image_1 as image',
                    DB::raw('SUM(order_details.quantity) as value')
                )
                ->groupBy('products.id', 'products.product_name', 'products.image_1')
                ->orderByDesc('value')
                ->limit(7)
                ->get();

            // Get recently purchased products
            $recentPurchases = DB::table('order_details')
                ->join('products', 'order_details.product_id', '=', 'products.id')
                ->join('orders', 'order_details.order_id', '=', 'orders.id')
                ->join('profiles', 'orders.profile_id', '=', 'profiles.id')
                ->select(
                    'products.product_name',
                    'products.image_1 as image',
                    'order_details.quantity',
                    'order_details.price',
                    'orders.created_at as purchase_date',
                    DB::raw("CONCAT(profiles.first_name, ' ', profiles.last_name) as customer_name")
                )
                ->orderBy('orders.created_at', 'desc')
                ->limit(5)
                ->get();

            return response()->json([
                'totalOrders' => $totalOrders,
                'totalRevenue' => $totalRevenue,
                'totalProducts' => $totalProducts,
                'totalUsers' => $totalUsers,
                'monthlySales' => $monthlySales,
                'topSellingProducts' => $topSellingProducts,
                'recentPurchases' => $recentPurchases
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching dashboard statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 