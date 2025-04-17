<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateProductColorTable extends Migration
{
    public function up()
    {
        // Drop the existing table and recreate it
        Schema::dropIfExists('product_color');

        Schema::create('product_color', function (Blueprint $table) {
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('color_id');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('color_id')->references('id')->on('colors')->onDelete('cascade');
            $table->primary(['product_id', 'color_id']);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('product_color');
    }
}