<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade'); // Proper foreign key
            $table->foreignId('brand_id')->constrained('brands')->onDelete('cascade'); // Proper foreign key
            $table->string('product_name');
            $table->string('product_type');
            $table->json('sizes');
            $table->json('colors');
            $table->decimal('price', 10, 2)->comment('Price in PHP');
            $table->text('description')->nullable();
            $table->string('image_1')->nullable();
            $table->enum('status', ['available', 'archived'])->default('available');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('products');
    }
};
