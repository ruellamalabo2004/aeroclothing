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
            $table->foreignId('chat_id')->constrained()->onDelete('cascade'); // Link to chat session
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Sender (user or admin)
            $table->text('message');
            $table->boolean('is_agent')->default(false); // true = admin/agent, false = customer
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('messages');
    }
}
