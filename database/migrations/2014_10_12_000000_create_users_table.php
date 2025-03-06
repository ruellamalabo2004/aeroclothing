<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('email', 100)->unique();
            $table->string('password', 100);
            $table->string('status')->default('Active'); // Added is_active column
            $table->timestamps();
            $table->timestamp('archive_at')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
}
