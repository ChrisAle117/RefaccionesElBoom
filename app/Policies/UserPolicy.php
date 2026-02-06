<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine if the user can view any users.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine if the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        // Users can view their own profile, admins can view all
        return $user->id === $model->id || $user->isAdmin();
    }

    /**
     * Determine if the user can create users.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine if the user can update the model.
     */
    public function update(User $user, User $model): bool
    {
        // Users can update their own profile, admins can update any
        return $user->id === $model->id || $user->isAdmin();
    }

    /**
     * Determine if the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        // Only admins can delete users, but not themselves
        return $user->isAdmin() && $user->id !== $model->id;
    }

    /**
     * Determine if the user can change roles.
     */
    public function changeRole(User $user, User $model): bool
    {
        // Only admins can change roles, but not their own
        return $user->isAdmin() && $user->id !== $model->id;
    }
}
