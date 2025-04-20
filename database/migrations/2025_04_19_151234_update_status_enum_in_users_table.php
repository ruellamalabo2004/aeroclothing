<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class UpdateStatusEnumInUsersTable extends Migration
{
    public function up()
    {
        // Change enum type using raw SQL
        DB::statement("ALTER TABLE users MODIFY status ENUM('active', 'archived') DEFAULT 'active'");
    }

    public function down()
    {
        // Revert to the original enum values if needed
        DB::statement("ALTER TABLE users MODIFY status ENUM('active', 'inactive') DEFAULT 'active'");
    }
}
