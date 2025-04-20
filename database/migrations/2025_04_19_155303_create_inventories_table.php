<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('inventories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->integer('stock_quantity');
            $table->enum('status', ['In Stock', 'Low Stock', 'Out of Stock'])->default('In Stock');
            $table->timestamp('last_stock_update')->nullable();
            $table->timestamps();
            $table->timestamp('archive_at')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('inventories'); // Fixed table name to match the create statement
    }
};
