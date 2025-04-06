<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMessagesTable extends Migration
{
    public function up()
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Links to the user who sent the message
            $table->text('message'); // The content of the message
            $table->boolean('is_agent')->default(false); // To distinguish whether the message is from an agent (true) or a user (false)
            $table->timestamps(); // Tracks when the message was created and updated
        });
    }

    public function down()
    {
        Schema::dropIfExists('messages');
    }
}
