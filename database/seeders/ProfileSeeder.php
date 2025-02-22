<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('profile')->insert([
            [
                'first_name'   => 'John',
                'middle_name'  => 'A.',
                'last_name'    => 'Doe',
                'date_of_birth'=> '1990-05-15',
                'gender'       => 'male',
                'age'          => 34,
                'profile_pic'  => 'john_doe.jpg',
                'created_at'   => Carbon::now(),
                'updated_at'   => Carbon::now(),
                'archive_at'   => null,
            ],
            [
                'first_name'   => 'Jane',
                'middle_name'  => null,
                'last_name'    => 'Smith',
                'date_of_birth'=> '1985-08-22',
                'gender'       => 'female',
                'age'          => 39,
                'profile_pic'  => 'jane_smith.jpg',
                'created_at'   => Carbon::now(),
                'updated_at'   => Carbon::now(),
                'archive_at'   => null,
            ],
            [
                'first_name'   => 'Alex',
                'middle_name'  => 'B.',
                'last_name'    => 'Johnson',
                'date_of_birth'=> '2000-12-10',
                'gender'       => 'other',
                'age'          => 24,
                'profile_pic'  => 'alex_johnson.jpg',
                'created_at'   => Carbon::now(),
                'updated_at'   => Carbon::now(),
                'archive_at'   => null,
            ],
        ]);
    }
}
