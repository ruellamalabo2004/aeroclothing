<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\DropdownController;
use App\Http\Controllers\UserController;



//user
Route::get('/users', [UserController::class, 'index']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::post('/users', [UserController::class, 'store']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::patch('/users/{id}/archive', [UserController::class, 'archive']);
Route::patch('/users/{id}/restore', [UserController::class, 'restore']);
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
// Invetory Routes
Route::get('/inventory', [InventoryController::class, 'index']);
Route::post('/inventory', [InventoryController::class, 'store']);
Route::put('/inventory/{inventory}', [InventoryController::class, 'update']);
Route::delete('/inventory/{inventory}', [InventoryController::class, 'destroy']);
Route::post('/inventory/{id}/restore', [InventoryController::class, 'restore']);

// User Registration Route
Route::post('/register', [AuthController::class, 'register']);

// Example Protected Route (Requires Authentication)
Route::middleware('auth:api')->group(function () {
    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });
});
