<?php

namespace App\Observers;

use App\Models\Product;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ProductObserver
{
    /**
     * Handle the Product "created" event.
     */
    public function created(Product $product): void
    {
        $this->clearProductCaches();
        Log::info('Product created, caches cleared', ['product_id' => $product->id_product]);
    }

    /**
     * Handle the Product "updated" event.
     */
    public function updated(Product $product): void
    {
        $this->clearProductCaches();
        
        // Clear specific product cache keys
        $this->clearProductSpecificCache($product->id_product);
        
        Log::info('Product updated, caches cleared', [
            'product_id' => $product->id_product,
            'changes' => $product->getChanges(),
        ]);
    }

    /**
     * Handle the Product "deleted" event.
     */
    public function deleted(Product $product): void
    {
        $this->clearProductCaches();
        Log::info('Product deleted, caches cleared', ['product_id' => $product->id_product]);
    }

    /**
     * Handle the Product "restored" event.
     */
    public function restored(Product $product): void
    {
        $this->clearProductCaches();
        Log::info('Product restored, caches cleared', ['product_id' => $product->id_product]);
    }

    /**
     * Clear all product-related caches
     */
    private function clearProductCaches(): void
    {
        // Clear known specific keys
        Cache::forget('products.oversell.incidences.full');
        Cache::forget('products.oversell.incidences.count');
        Cache::forget('product_types.sort_order');
        
        // Note: For production with Redis, implement pattern-based cache clearing
        // using Cache::connection()->keys('products_listing_*')
        Log::debug('Product caches cleared');
    }

    /**
     * Clear product-specific cache entries
     */
    private function clearProductSpecificCache(int $productId): void
    {
        // Use the Product model's method to ensure consistency
        Product::clearProductSpecificCache($productId);
    }
}
