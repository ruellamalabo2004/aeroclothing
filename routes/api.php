<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\DropdownController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ChangePasswordController;
use App\Http\Controllers\ForgotPasswordController;
use App\Http\Controllers\ResetPasswordController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\OrderDetailController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\CourierController;
// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::get('/dropdowns', [DropdownController::class, 'getDropdowns']);
Route::apiResource('categories', CategoryController::class);
Route::apiResource('brands', BrandController::class);
Route::apiResource('products', ProductController::class);
Route::put('/products/{id}', [ProductController::class, 'update']);

Route::get('/customers', [UserController::class, 'getCustomers']);
// Public access
Route::apiResource('users', UserController::class);
Route::get('/couriers', [CourierController::class, 'index']);
// Protected routes (Require Authentication)
Route::middleware('auth:api')->group(function () {
    // Orders
    Route::apiResource('orders', OrderController::class);
    Route::patch('/orders/{id}/archive', [OrderController::class, 'archive']);
    Route::patch('/orders/{id}/restore', [OrderController::class, 'restore']);
    Route::post('/orders/{id}/tracking', [OrderController::class, 'trackOrder']);
    Route::get('/orders/{id}/tracking', [OrderController::class, 'getTrackingStatus']);


    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/orders/{orderId}/status/{newStatus}', [OrderController::class, 'updateOrderStatus']);
    // Order Details
    Route::apiResource('order-details', OrderDetailController::class);
    Route::patch('/order-details/{id}/archive', [OrderDetailController::class, 'archive']);
    Route::patch('/order-details/{id}/restore', [OrderDetailController::class, 'restore']);
//Courrier
Route::post('/couriers', [CourierController::class, 'store']);    // Create
    Route::put('/couriers/{id}', [CourierController::class, 'update']); // Update
    Route::delete('/couriers/{id}', [CourierController::class, 'destroy']);

    // Cart
    Route::get('/cart', [CartController::class, 'getCart']);
    Route::post('/cart/add', [CartController::class, 'addToCart']);
    Route::delete('/cart/remove/{id}', [CartController::class, 'removeFromCart']);
    Route::delete('/cart/clear', [CartController::class, 'clearCart']);

    // Wishlist
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist', [WishlistController::class, 'store']);
    Route::delete('/wishlist/{id}', [WishlistController::class, 'destroy']);

    // User Management
    Route::patch('/users/{id}/archive', [UserController::class, 'archive']);
    Route::patch('/users/{id}/restore', [UserController::class, 'restore']);
    Route::get('/users/count', [UserController::class, 'getTotalUsers']);
    
    // Profile
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/update-profile', [AuthController::class, 'updateProfile']);
    Route::post('/change-password', [ChangePasswordController::class, 'changePassword']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

// Inventory
Route::apiResource('inventory', InventoryController::class);
