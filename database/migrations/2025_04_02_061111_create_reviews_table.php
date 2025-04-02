<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateReviewsTable extends Migration
{
    public function up()
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Links to users table
            $table->foreignId('product_id')->constrained()->onDelete('cascade'); // Links to products table
            $table->foreignId('order_id')->nullable(false)->constrained('orders')->onDelete('cascade'); // Links to orders table (cannot be null)
            $table->text('review')->nullable(); // User's review text
            $table->integer('rating'); // Rating (1-5)
            $table->timestamps(); // Created at and updated at
        });
    }

    public function down()
    {
        Schema::dropIfExists('reviews');
    }
}
