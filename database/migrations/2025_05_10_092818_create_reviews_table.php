<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateReviewsTable extends Migration
{
    public function up()
    {
        // Main reviews table
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');      // who made the review
            $table->unsignedBigInteger('product_id');   // product being reviewed
            $table->unsignedBigInteger('order_id')->nullable(); // optional: to verify purchase
            $table->text('review')->nullable();         // actual text content
            $table->unsignedTinyInteger('rating');      // 1 to 5
            $table->text('reply')->nullable();          // optional admin reply
            $table->softDeletes();                      // archived_at
            $table->timestamps();

            // Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('set null');
        });

        // Related images table
        Schema::create('review_images', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('review_id');
            $table->string('image_path'); // image file path or URL
            $table->timestamps();

            $table->foreign('review_id')->references('id')->on('reviews')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('review_images');
        Schema::dropIfExists('reviews');
    }
}
