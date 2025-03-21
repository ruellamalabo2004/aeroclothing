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
use App\Http\Controllers\OrderItemController;



Route::middleware('auth:api')->prefix('order-items')->group(function () {
    Route::get('/', [OrderItemController::class, 'index']);  // Get all order items
    Route::get('/{id}', [OrderItemController::class, 'show']);  // Get single order item
    Route::post('/', [OrderItemController::class, 'store']);  // Create order item
    Route::put('/{id}', [OrderItemController::class, 'update']);  // Update order item
    Route::delete('/{id}', [OrderItemController::class, 'destroy']);  // Delete order item
});

Route::middleware('auth:api')->get('/cart', [OrderController::class, 'cart']);
Route::middleware('auth:api')->get('/cart', [CartController::class, 'index']);


Route::middleware('auth:api')->group(function () {
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist', [WishlistController::class, 'store']);
    Route::delete('/wishlist/{id}', [WishlistController::class, 'destroy']);
});

Route::middleware('auth:api')->group(function () {
    Route::get('/cart', [CartController::class, 'getCart']);
    Route::post('/cart/add', [CartController::class, 'addToCart']);
    Route::delete('/cart/remove/{id}', [CartController::class, 'removeFromCart']);
    Route::delete('/cart/clear', [CartController::class, 'clearCart']);
});
Route::apiResource('brands', BrandController::class);

// In routes/api.php
Route::post('forgot-password', [ForgotPasswordController::class, 'sendResetLinkEmail']);
// routes/api.php
Route::post('/reset-password', [ResetPasswordController::class, 'reset']);
Route::post('/password/reset', [ResetPasswordController::class, 'reset']);

//Category
Route::apiResource('categories', CategoryController::class);
//user
Route::get('/users', [UserController::class, 'index']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::post('/users', [UserController::class, 'store']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::patch('/users/{id}/archive', [UserController::class, 'archive']);
Route::patch('/users/{id}/restore', [UserController::class, 'restore']);
Route::get('/users/count', [UserController::class, 'getTotalUsers']);


//login
Route::post('/login', [AuthController::class, 'login']);
Route::get('/dropdowns', [DropdownController::class, 'getDropdowns']);

//orders
Route::get('/orders', [OrderController::class, 'index']);
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/{id}', [OrderController::class, 'show']);
Route::put('/orders/{id}', [OrderController::class, 'update']);
Route::delete('/orders/{id}/archive', [OrderController::class, 'archive']);
Route::post('/orders/{id}/restore', [OrderController::class, 'restore']);



// Product routes
Route::apiResource('products', ProductController::class);
Route::put('/products/{id}', [ProductController::class, 'update']);



/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application.
| These routes are loaded by the RouteServiceProvider within a group
| which is assigned the "api" middleware group. Enjoy building your API!
|
*/
Route::get('/inventory', [InventoryController::class, 'index']);
Route::post('/inventory', [InventoryController::class, 'store']);
Route::put('/inventory/{id}', [InventoryController::class, 'update']);
Route::delete('/inventory/{id}', [InventoryController::class, 'destroy']);

// User Registration Route
Route::post('/register', [AuthController::class, 'register']);

// Example Protected Route (Requires Authentication)
Route::middleware('auth:api')->group(function () {
    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });
    // Fetch user profile
    Route::get('/profile', [AuthController::class, 'profile']);


    // Update user profile
    Route::put('/update-profile', [AuthController::class, 'updateProfile']);

    Route::middleware('auth:api')->post('/change-password', [ChangePasswordController::class, 'changePassword']);
    Route::middleware('auth:api')->post('/logout', [AuthController::class, 'logout']);
 
});
