<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Update chats table
        Schema::table('chats', function (Blueprint $table) {
            if (!Schema::hasColumn('chats', 'archived_at')) {
                $table->timestamp('archived_at')->nullable();
            }
            if (!Schema::hasColumn('chats', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        // Update messages table
        Schema::table('messages', function (Blueprint $table) {
            if (!Schema::hasColumn('messages', 'is_read')) {
                $table->boolean('is_read')->default(false);
            }
            if (!Schema::hasColumn('messages', 'archived_at')) {
                $table->timestamp('archived_at')->nullable();
            }
            if (!Schema::hasColumn('messages', 'deleted_at')) {
                $table->softDeletes();
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('chats', function (Blueprint $table) {
            $table->dropColumn('archived_at');
            $table->dropSoftDeletes();
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn(['is_read', 'archived_at']);
            $table->dropSoftDeletes();
        });
    }
};
