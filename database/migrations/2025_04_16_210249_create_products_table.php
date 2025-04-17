<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProductsTable extends Migration
{
    public function up()
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->foreignId('brand_id')->constrained()->onDelete('cascade');
            $table->string('product_name');
            $table->enum('product_type', ['TOPS', 'BOTTOMS', 'JACKET', 'SWIMWEAR']);
            $table->string('sizes'); // Store sizes as a comma-separated string
            $table->string('colors'); // Store selected colors as a comma-separated string
            $table->string('image_1');
            $table->string('image_2');
            $table->enum('status', ['available', 'archived'])->default('available');
            $table->text('description');
            $table->decimal('price', 8, 2);
            $table->timestamps();
            $table->softDeletes(); // This will add archived_at column for soft deletes
        });
    }

    public function down()
    {
        Schema::dropIfExists('products');
    }
}
