<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddStatusAndArchivedAtToCategoriesAndBrandsTables extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
{
    Schema::table('categories', function (Blueprint $table) {
        $table->string('status')->default('active');
        $table->timestamp('archived_at')->nullable();
    });

    Schema::table('brands', function (Blueprint $table) {
        $table->string('status')->default('active');
        $table->timestamp('archived_at')->nullable();
    });
}

public function down()
{
    Schema::table('categories', function (Blueprint $table) {
        $table->dropColumn(['status', 'archived_at']);
    });

    Schema::table('brands', function (Blueprint $table) {
        $table->dropColumn(['status', 'archived_at']);
    });
}
}
