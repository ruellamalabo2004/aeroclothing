<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();

            // Foreign key to users table
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            // Foreign key to countries table
            $table->unsignedBigInteger('country_id');
            $table->foreign('country_id')->references('id')->on('countries')->onDelete('restrict');

            // Address info
            $table->string('recipient_name');
            $table->string('phone_number');
            $table->string('region')->nullable();
            $table->string('city')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('street_address');

            $table->boolean('is_default')->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('addresses');
    }
};
