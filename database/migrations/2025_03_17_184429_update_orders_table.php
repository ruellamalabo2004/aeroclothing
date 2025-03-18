<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('product_id'); // Remove product_id (not needed in Orders)
            $table->dropColumn('customer'); // Remove customer field (if needed)
            
            // Ensure shipping_id is a foreign key
            $table->foreignId('shipping_id')->nullable()->change()->constrained('shippings')->onDelete('cascade');

            // Add soft deletes to match schema
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedBigInteger('product_id')->nullable();
            $table->string('customer');
            $table->dropSoftDeletes();
        });
    }
};
