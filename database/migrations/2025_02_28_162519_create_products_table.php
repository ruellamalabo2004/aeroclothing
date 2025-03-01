<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('category_id');
            $table->string('type');
            $table->string('sub_type');
            $table->text('size'); // Will store multiple sizes as JSON
            $table->string('product_name', 100);
            $table->text('description');
            $table->decimal('price', 10, 2);
            $table->integer('stock_quantity');
            $table->json('payment_methods'); // Multiple payment methods as JSON
            $table->enum('status', ['Published', 'Archived'])->default('Published');
            $table->timestamps();
            $table->softDeletes();
    
            //$table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
        });
    }
    
    

    public function down() {
        Schema::dropIfExists('products');
    }
};