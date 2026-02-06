<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Gate;
use App\Models\Product;
use App\Models\Order;
use App\Models\User;
use App\Policies\ProductPolicy;
use App\Policies\OrderPolicy;
use App\Policies\UserPolicy;
use App\Observers\ProductObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if(app()->environment('production')) {
            \URL::forceScheme('https');
        }

        // Register policies
        Gate::policy(Product::class, ProductPolicy::class);
        Gate::policy(Order::class, OrderPolicy::class);
        Gate::policy(User::class, UserPolicy::class);

        // Register observers
        Product::observe(ProductObserver::class);
    }
}
