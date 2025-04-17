<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    public function run()
    {
        User::create([
            'email' => 'admin@example.com',
            'password' => bcrypt('yourpassword'), // Make sure to hash the password
            'role' => 'admin', // Assign the admin role
        ]);
    }
}
