<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('password');
            $table->foreignId('role_id')->constrained('roles')->onDelete('cascade'); // FK to roles table
            $table->string('status')->default('active'); // e.g., active, archived
            $table->timestamps();
            $table->softDeletes('archived_at'); // renamed from deleted_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
