<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ClearProfilesTable extends Seeder
{
    public function run()
    {
        DB::table('profiles')->truncate(); // This will clear all data in the profiles table.
    }
}
