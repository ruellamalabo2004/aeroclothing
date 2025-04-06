<?php

namespace App\Policies;

use App\Models\Address;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Support\Facades\Log;

class AddressPolicy
{
    use HandlesAuthorization;

    public function update(User $user, Address $address)
    {
        Log::info("Update Policy - User ID: {$user->id}, Address User ID: {$address->user_id}");
        return $user->id === $address->user_id;
    }

    public function delete(User $user, Address $address)
    {
        Log::info("Delete Policy - User ID: {$user->id}, Address User ID: {$address->user_id}");
        return $user->id === $address->user_id;
    }

    public function setDefault(User $user, Address $address)
    {
        Log::info("SetDefault Policy - User ID: {$user->id}, Address User ID: {$address->user_id}");
        return $user->id === $address->user_id;
    }
}