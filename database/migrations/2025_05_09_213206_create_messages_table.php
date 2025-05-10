<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMessagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
   public function up()
{
    Schema::create('messages', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('chat_id');
        $table->unsignedBigInteger('user_id')->nullable(); // could be null if system message
        $table->text('message')->nullable(); // allow null in case only image is sent
        $table->string('image_path')->nullable(); // stores the image filename or path
        $table->boolean('is_agent')->default(false);
        $table->timestamps();
        $table->timestamp('archived_at')->nullable();

        // Foreign key constraints
        $table->foreign('chat_id')->references('id')->on('chats')->onDelete('cascade');
        $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
    });
}

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('messages');
    }
}
