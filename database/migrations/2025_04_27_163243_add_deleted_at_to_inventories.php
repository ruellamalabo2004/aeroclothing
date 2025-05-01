<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddDeletedAtToInventories extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('inventories', function (Blueprint $table) {
            $table->softDeletes(); // Adds a 'deleted_at' column for soft deletes
        });
    }
    
    public function down()
    {
        Schema::table('inventories', function (Blueprint $table) {
            $table->dropSoftDeletes(); // Removes the 'deleted_at' column
        });
    }
}    