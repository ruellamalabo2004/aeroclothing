<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('profile_id')->constrained('profiles')->onDelete('cascade');
            $table->string('payment_method');
            $table->decimal('total_amount', 10, 2);
            $table->dateTime('order_date')->default(now());
            $table->enum('status', ['PENDING', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELED', 'RETURNED'])->default('PENDING');
            $table->timestamps();
            $table->softDeletes(); // Enables archiving (deleted_at)
        });
    }

    public function down() {
        Schema::dropIfExists('orders');
    }
};
