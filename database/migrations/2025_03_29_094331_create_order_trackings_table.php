<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('order_trackings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->enum('status', ['PENDING', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELED', 'RETURNED']);
            $table->text('remarks')->nullable(); // Stores reasons for cancelation/return
            $table->timestamps();
        });
    }

    public function down() {
        Schema::dropIfExists('order_trackings');
    }
};

