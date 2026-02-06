<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    /**
     * Determine if the user can view any products.
     */
    public function viewAny(?User $user): bool
    {
        // Anyone can view products (including guests)
        return true;
    }

    /**
     * Determine if the user can view the product.
     */
    public function view(?User $user, Product $product): bool
    {
        // Anyone can view active products
        return $product->active || ($user && $user->isAdmin());
    }

    /**
     * Determine if the user can create products.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine if the user can update the product.
     */
    public function update(User $user, Product $product): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine if the user can delete the product.
     */
    public function delete(User $user, Product $product): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine if the user can restore the product.
     */
    public function restore(User $user, Product $product): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine if the user can permanently delete the product.
     */
    public function forceDelete(User $user, Product $product): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine if the user can manage product stock.
     */
    public function manageStock(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine if the user can sync stock with warehouse.
     */
    public function syncStock(User $user): bool
    {
        return $user->isAdmin();
    }
}
