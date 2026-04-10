<?php

namespace App\Policies;

use App\Models\Appointment;
use App\Models\Client;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class AppointmentPolicy
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
    public function view(User $user, Appointment $appointment): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('barber')) {
            return $appointment->barber_id === $user->id;
        }

        if ($user->hasRole('client')) {
            $client = Client::where('user_id', $user->id)->first();
            return $client && $appointment->client_id === $client->id;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create appointments') || $user->hasPermissionTo('book appointments');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Appointment $appointment): bool
    {
        if ($user->hasRole('admin')) {
            return $user->hasPermissionTo('edit appointments');
        }

        if ($user->hasRole('barber')) {
            return $appointment->barber_id === $user->id;
        }

        if ($user->hasRole('client')) {
            $client = Client::where('user_id', $user->id)->first();
            return $client && $appointment->client_id === $client->id &&
                   in_array($appointment->status, ['pending', 'confirmed']);
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Appointment $appointment): bool
    {
        if ($user->hasRole('admin')) {
            return $user->hasPermissionTo('delete appointments');
        }

        if ($user->hasRole('client')) {
            $client = Client::where('user_id', $user->id)->first();
            return $client && $appointment->client_id === $client->id &&
                   $appointment->status === 'pending' &&
                   $appointment->appointment_date > now();
        }

        return false;
    }

    /**
     * Determine whether the user can change appointment status.
     */
    public function changeStatus(User $user, Appointment $appointment): bool
    {
        if ($user->hasRole('admin')) {
            return $user->hasPermissionTo('edit appointments');
        }

        if ($user->hasRole('barber')) {
            return $appointment->barber_id === $user->id;
        }

        return false;
    }
}
