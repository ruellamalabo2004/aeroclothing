<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProfilesTable extends Migration
{
    public function up()
    {
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('suffix')->nullable();
            $table->date('date_of_birth');
            $table->enum('gender', ['Male', 'Female', 'Other'])->nullable();
            $table->string('profile_pic')->nullable();
            $table->timestamps();
            $table->softDeletes(); // to handle archived_at column for soft deletes
        });
    }

    public function down()
    {
        Schema::dropIfExists('profiles');
    }
}
