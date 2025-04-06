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
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\AddressController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::get('/dropdowns', [DropdownController::class, 'getDropdowns']);
Route::apiResource('categories', CategoryController::class);
Route::apiResource('brands', BrandController::class);
Route::apiResource('products', ProductController::class);
Route::put('/products/{id}', [ProductController::class, 'update']);



Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLinkEmail']);
Route::get('/reviews/{productId}', [ReviewController::class, 'getReviews']);

Route::get('/customers', [UserController::class, 'getCustomers']);
// Public access
Route::apiResource('users', UserController::class);
Route::get('/couriers', [CourierController::class, 'index']);
Route::get('/admin/orders', [OrderController::class, 'adminIndex'])->middleware('auth:api');

// Protected routes (Require Authentication)
Route::middleware('auth:api')->group(function () {
    // Orders
    Route::apiResource('orders', OrderController::class);
    Route::patch('/orders/{id}/archive', [OrderController::class, 'archive']);
    Route::patch('/orders/{id}/restore', [OrderController::class, 'restore']);
    Route::post('/orders/{id}/tracking', [OrderController::class, 'trackOrder']);
    Route::get('/orders/{id}/tracking', [OrderController::class, 'getTrackingStatus']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);
    Route::post('/orders/{orderId}/order-details/{orderDetailId}/review', [OrderController::class, 'submitReview']);
    Route::post('/reviews', [ReviewController::class, 'store']); // Use 'store' instead of 'addReview'
    Route::get('/reviews/user', [ReviewController::class, 'userReviews']);
    Route::get('/reviews/{productId}', [ReviewController::class, 'getReviews']);
    Route::put('/reviews/{id}', [ReviewController::class, 'updateReview']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'deleteReview']);

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

//chat
Route::post('chat/send', [ChatController::class, 'sendMessage']);
Route::get('chat/history/{userId}', [ChatController::class, 'getChatHistory']);

    // Review
    Route::get('/reviews', [ReviewController::class, 'index']);
    Route::post('/reviews/{id}/reply', [ReviewController::class, 'reply']);
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
    
    //address
    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::get('/addresses/{id}', [AddressController::class, 'show']);
    Route::put('/addresses/{id}', [AddressController::class, 'update']);
    Route::delete('/addresses/{id}', [AddressController::class, 'destroy']);
    Route::patch('/addresses/{id}/set-default', [AddressController::class, 'setDefault']);
    // Reviews

    Route::post('/reviews', [ReviewController::class, 'addReview']);
    Route::put('/reviews/{id}', [ReviewController::class, 'updateReview']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'deleteReview']);

    // Profile
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/update-profile', [AuthController::class, 'updateProfile']);
    Route::post('/change-password', [ChangePasswordController::class, 'changePassword']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

// Inventory
Route::apiResource('inventory', InventoryController::class);
