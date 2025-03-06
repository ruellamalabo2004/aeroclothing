<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('category')->index(); // Index for faster lookups
            $table->string('product_name');
            $table->string('product_type');
            $table->string('brand'); // Added brand column (dropdown selection)
            $table->json('sizes');
            $table->json('colors'); // Added colors column (multi-select)
            $table->decimal('price', 10, 2)->comment('Price in PHP'); // Clarified currency
            $table->text('description')->nullable();
            $table->string('image_1')->nullable();
            $table->enum('status', ['available', 'archived'])->default('available')->index(); // Index for filtering
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('products');
    }
};
