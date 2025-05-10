<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateReviewImagesTable extends Migration
{
    public function up()
    {
        Schema::create('review_images', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('review_id');
            $table->string('image_path');
            $table->timestamps();

            $table->foreign('review_id')->references('id')->on('reviews')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('review_images');
    }
}

