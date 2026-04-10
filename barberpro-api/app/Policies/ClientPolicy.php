<?php

namespace App\Policies;

use App\Models\Client;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ClientPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRole(['admin', 'barber']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Client $client): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('barber')) {
            // Barber can see clients from salons they work in
            return $user->salons()->where('salons.id', $client->salon_id)->exists();
        }

        if ($user->hasRole('client')) {
            // Client can only see their own profile
            return $client->user_id === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create clients');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Client $client): bool
    {
        if ($user->hasRole('admin')) {
            return $user->hasPermissionTo('edit clients');
        }

        if ($user->hasRole('barber')) {
            return $user->salons()->where('salons.id', $client->salon_id)->exists();
        }

        if ($user->hasRole('client')) {
            return $client->user_id === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Client $client): bool
    {
        return $user->hasPermissionTo('delete clients');
    }
}
