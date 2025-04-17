<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\ColorController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::patch('/products/{id}/restore', [ProductController::class, 'restore']);
Route::patch('/products/{id}/archive', [ProductController::class, 'archive']);

// Public routes for products, categories, brands, and colors
Route::apiResource('products', ProductController::class);  // Make entire product routes public
Route::get('categories', [CategoryController::class, 'index']);
Route::get('brands', [BrandController::class, 'index']);
Route::get('colors', [ColorController::class, 'index']);

// Protected routes (authentication required)
Route::middleware('auth:api')->group(function () {
    // User-related routes
    Route::get('user', [UserController::class, 'getUser']);
});
