<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    /**
     * Determine if the user can view any orders.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine if the user can view the order.
     */
    public function view(User $user, Order $order): bool
    {
        // Users can view their own orders, admins can view all
        return $user->isAdmin() || $order->user_id === $user->id;
    }

    /**
     * Determine if the user can create orders.
     */
    public function create(User $user): bool
    {
        // Any authenticated user can create orders
        return true;
    }

    /**
     * Determine if the user can update the order.
     */
    public function update(User $user, Order $order): bool
    {
        // Only admins can update orders
        return $user->isAdmin();
    }

    /**
     * Determine if the user can delete the order.
     */
    public function delete(User $user, Order $order): bool
    {
        // Only admins can delete orders
        return $user->isAdmin();
    }

    /**
     * Determine if the user can cancel the order.
     */
    public function cancel(User $user, Order $order): bool
    {
        // Users can cancel their own pending orders, admins can cancel any
        if ($user->isAdmin()) {
            return true;
        }

        return $order->user_id === $user->id && in_array($order->status, ['pending', 'processing']);
    }

    /**
     * Determine if the user can approve payments for the order.
     */
    public function approvePayment(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine if the user can manage order status.
     */
    public function manageStatus(User $user): bool
    {
        return $user->isAdmin();
    }
}
