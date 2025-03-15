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
            $table->foreignId('address_id')->nullable()->constrained()->onDelete('set null');

            $table->string('first_name', 100);
            $table->string('middle_name', 100)->nullable();
            $table->string('last_name', 100);
            $table->string('suffix', 50)->nullable();

            $table->date('date_of_birth');
            $table->enum('gender', ['Male', 'Female', 'Other']);

            $table->string('phone_number', 20)->nullable();

            $table->string('profile_pic', 255)->nullable();
        
            $table->timestamps();
            $table->timestamp('archived_at')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('profiles');
    }
}