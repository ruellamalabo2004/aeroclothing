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

            // Foreign keys
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->foreignId('brand_id')->constrained()->onDelete('cascade');

            // Product info
            $table->string('product_name');

            // Foreign key for product type (optional)
            $table->unsignedBigInteger('product_type_id')->nullable();
            $table->foreign('product_type_id')->references('id')->on('product_types')->onDelete('set null');

            // Image paths
            $table->string('image_1');
            $table->string('image_2');

            $table->enum('status', ['available', 'archived'])->default('available');
            $table->text('description');
            $table->decimal('price', 8, 2);

            $table->timestamps();

            // Use archived_at instead of deleted_at
            $table->timestamp('archived_at')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('products');
    }
}
