<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrdersTable extends Migration {
    public function up() {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('shipping_id');
            $table->unsignedBigInteger('product_id');
            $table->string('customer'); // Fixed: Customer instead of customer_name
            $table->string('payment_method');
            $table->decimal('total_amount', 10, 2); // Fixed precision
            $table->dateTime('date');
            $table->enum('status', ['Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled', 'Returned']);
            $table->timestamps();
            $table->dateTime('archive_at')->nullable();
        });
    }

    public function down() {
        Schema::dropIfExists('orders');
    }
}