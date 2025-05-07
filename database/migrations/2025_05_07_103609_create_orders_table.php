<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrdersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
{
    Schema::create('orders', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('profile_id'); // FK to profiles table
        $table->unsignedBigInteger('shipping_method_id'); // FK to shipping_methods
        $table->unsignedBigInteger('payment_method_id'); // FK to payment_methods
        $table->decimal('total_amount', 10, 2);
        $table->dateTime('order_date')->useCurrent();
        $table->enum('status', [
            'Pending',
            'Processing',
            'Shipped',
            'Delivering',
            'Completed',
            'Canceled',
            'Returned'
        ])->default('Pending');
        
        $table->timestamps();
        $table->softDeletes(); // archived_at

        // Foreign keys
        $table->foreign('profile_id')->references('id')->on('profiles')->onDelete('cascade');
        $table->foreign('shipping_method_id')->references('id')->on('shipping_methods')->onDelete('restrict');
        $table->foreign('payment_method_id')->references('id')->on('payment_methods')->onDelete('restrict');
    });
}


    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('orders');
    }
}
