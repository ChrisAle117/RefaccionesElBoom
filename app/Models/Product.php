<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'id_product';

    protected $fillable = [
        'name', 'code', 'description', 'price', 'disponibility', 'reserved_stock',
        'type', 'image', 'audio_path', 'active', 'weight', 'length', 'width', 'height',
        'variant_group', 'variant_group_opt_out', 'variant_color_hex', 'variant_color_label',
    ];

    protected $casts = [
        'id_product'            => 'integer',
        'price'                 => 'float',
        'disponibility'         => 'integer',
        'reserved_stock'        => 'integer',
        'active'                => 'boolean',
        'weight'                => 'float',
        'length'                => 'float',
        'width'                 => 'float',
        'height'                => 'float',
        'variant_group_opt_out' => 'boolean',
    ];

    protected static array $livePriceBuffer = [];
    protected static array $liveStockBuffer = [];

    private const MISS = '__MISS__';

    // --- ACCESORS ---

    public function getPriceAttribute($localValue)
    {
        $id = $this->getAttribute('id_product');
        if (!$id) return $localValue;

        if (array_key_exists($id, static::$livePriceBuffer)) {
            $price = static::$livePriceBuffer[$id];
            return ($price !== null && $price !== self::MISS) ? (float) $price : $this->fallbackPrice($localValue);
        }

        $map = static::fetchPriceMap([$id]);
        static::$livePriceBuffer = static::$livePriceBuffer + $map;

        $price = static::$livePriceBuffer[$id] ?? null;
        return ($price !== null && $price !== self::MISS) ? (float) $price : $this->fallbackPrice($localValue);
    }

    public function getDisponibilityAttribute($localValue)
    {
        if (!config('warehouse.stock_use_remote', false)) {
            return (int) $localValue;
        }

        $id = $this->getAttribute('id_product');
        if (!$id) return (int) $localValue;

        if (array_key_exists($id, static::$liveStockBuffer)) {
            $stock = static::$liveStockBuffer[$id];
            return ($stock !== null && $stock !== self::MISS) ? (int) $stock : $this->fallbackStock($localValue);
        }

        $map = static::fetchStockMap([$id]);
        static::$liveStockBuffer = static::$liveStockBuffer + $map;

        $stock = static::$liveStockBuffer[$id] ?? null;
        return ($stock !== null && $stock !== self::MISS) ? (int) $stock : $this->fallbackStock($localValue);
    }

    protected function fallbackPrice($localValue)
    {
        return config('warehouse.fallback_local', true) ? $localValue : null;
    }

    protected function fallbackStock($localValue)
    {
        return config('warehouse.stock_fallback_local', true) ? (int)$localValue : 0;
    }

    // --- FETCH LOGIC ---

    protected static function fetchPriceMap(array $ids): array
    {

        $ids = array_values(array_unique(array_filter($ids, fn ($v) => $v !== null)));
        if (empty($ids)) return [];

        $ttl   = (int) config('warehouse.price_ttl', 1800);
        $grupo = config('warehouse.group_clave');
        $result = [];
        $pending = [];

        foreach ($ids as $id) {
            $key = 'wh:price:' . ($grupo ?: 'ALL') . ':' . $id;
            if (Cache::has($key)) {
                $result[$id] = Cache::get($key);
            } else {
                $pending[] = $id;
            }
        }
        if (empty($pending)) return $result;

        $codesById = self::whereIn('id_product', $pending)->pluck('code', 'id_product')->toArray();

        foreach (array_chunk($pending, 500) as $chunkIds) {
            $chunkCodes = [];
            foreach ($chunkIds as $pid) {
                if ($code = $codesById[$pid] ?? null) $chunkCodes[$pid] = $code;
                else {
                    $result[$pid] = self::MISS;
                    Cache::put('wh:price:' . ($grupo ?: 'ALL') . ':' . $pid, self::MISS, $ttl);
                }
            }

            if (empty($chunkCodes)) continue;

            try {
                $rows = DB::connection('warehouse')
                    ->table('inv_articulo as ia')
                    ->join('inv_articulo_precio_grupo_almacenes as iapga', 'iapga.articulo_id', '=', 'ia.id')
                    ->join('inv_almacen_grupo as iag', 'iag.id', '=', 'iapga.grupo_id')
                    ->whereIn('ia.codigo', array_values($chunkCodes))
                    ->where('iapga.precio', '<>', 0)
                    ->when($grupo, fn ($q) => $q->where('iag.clave', $grupo))
                    ->selectRaw('ia.codigo as codigo, MIN(ROUND((iapga.precio * 1.16), 2)) as precio_publico')
                    ->groupBy('ia.codigo')->get();

                $priceByCode = $rows->pluck('precio_publico', 'codigo')->toArray();

                foreach ($chunkCodes as $pid => $code) {
                    $price = $priceByCode[$code] ?? null;
                    $val = ($price !== null) ? (float)$price : self::MISS;
                    $result[$pid] = $val;
                    Cache::put('wh:price:' . ($grupo ?: 'ALL') . ':' . $pid, $val, $ttl);
                }
            } catch (\Throwable $e) {
                Log::warning('Warehouse price fetch failed', ['error' => $e->getMessage()]);
            }
        }
        return $result;
    }

    protected static function fetchStockMap(array $ids): array
    {
        $ids = array_values(array_unique(array_filter($ids, fn ($v) => $v !== null)));
        if (empty($ids)) return [];

        $ttl = (int) config('warehouse.stock_ttl', 300);
        $almacenId = (int) config('warehouse.stock_almacen_id', 1);
        $result = [];
        $pending = [];

        foreach ($ids as $id) {
            $key = 'wh:stock:almacen:' . $almacenId . ':' . $id;
            if (Cache::has($key)) {
                $result[$id] = Cache::get($key);
            } else {
                $pending[] = $id;
            }
        }
        if (empty($pending)) return $result;

        $codesById = self::whereIn('id_product', $pending)->pluck('code', 'id_product')->toArray();

        try {
            foreach (array_chunk($pending, 500) as $chunkIds) {
                $chunkCodes = array_intersect_key($codesById, array_flip($chunkIds));
                
                if (empty($chunkCodes)) continue;

                $rows = DB::connection('warehouse')
                    ->table('inv_articulo as ia')
                    ->join('inv_existencia as ie', 'ie.inv_articulo_id', '=', 'ia.id')
                    ->selectRaw('ia.codigo as codigo, SUM(ie.cantidad_existencia) as existencia')
                    ->where('ie.inv_almacen_id', $almacenId)
                    ->whereIn('ia.codigo', array_values($chunkCodes))
                    ->groupBy('ia.codigo')->get();

                $stockByCode = $rows->pluck('existencia', 'codigo')->toArray();

                foreach ($chunkCodes as $pid => $code) {
                    $key = 'wh:stock:almacen:' . $almacenId . ':' . $pid;
                    
                    // CAMBIO CLAVE: Solo si el código existe en el almacén actualizamos
                    if (array_key_exists($code, $stockByCode)) {
                        $val = (int) $stockByCode[$code];
                        $result[$pid] = $val;
                        Cache::put($key, $val, $ttl);

                        if (config('warehouse.stock_auto_sync_local', false)) {
                            DB::table('products')->where('id_product', $pid)->update(['disponibility' => $val]);
                        }
                    } else {
                        // Si no existe en el almacén, no sobreescribimos con 0 la DB local
                        $result[$pid] = self::MISS;
                        Cache::put($key, self::MISS, $ttl);
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Warehouse stock fetch failed', ['error' => $e->getMessage()]);
        }
        return $result;
    }

    // --- HELPER METHODS ---

    public static function primePrices($products): void
    {
        if (empty($products)) return;
        $ids = is_iterable($products)
            ? (new Collection($products))->pluck('id_product')->unique()->all()
            : [$products->id_product];

        $map = static::fetchPriceMap($ids);
        static::$livePriceBuffer = static::$livePriceBuffer + $map;
    }

    public static function primeStock($products): void
    {
        if (empty($products)) return;
        $ids = is_iterable($products)
            ? (new Collection($products))->pluck('id_product')->unique()->all()
            : [$products->id_product];

        $map = static::fetchStockMap($ids);
        static::$liveStockBuffer = static::$liveStockBuffer + $map;
    }

    public function getAudioUrlAttribute(): ?string
    {
        $path = (string) ($this->attributes['audio_path'] ?? '');
        return ($path !== '') ? \Illuminate\Support\Facades\Storage::url($path) : null;
    }

    public function orderItems(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(OrderItem::class, 'product_id', 'id_product');
    }

    /**
     * Sync local stock from warehouse for given product IDs
     * 
     * @param array $ids Array of product IDs to sync
     * @return int Number of products updated
     */
    public static function syncLocalStock(array $ids): int
    {
        if (empty($ids)) {
            return 0;
        }

        $ids = array_values(array_unique(array_filter($ids)));

        try {
            $stockMap = static::fetchStockMap($ids);
            
            // Use transaction to ensure atomicity of updates and cache clearing
            $updated = DB::transaction(function () use ($stockMap, $ids) {
                $count = 0;
                foreach ($stockMap as $productId => $stock) {
                    if ($stock !== null && $stock !== self::MISS) {
                        DB::table('products')
                            ->where('id_product', $productId)
                            ->update(['disponibility' => (int) $stock]);
                        $count++;
                    }
                }

                // Clear caches after bulk update since we're using DB::table()
                static::clearProductCaches($ids);
                
                return $count;
            });

            Log::info('Stock sync completed', [
                'products_synced' => $updated,
                'total_requested' => count($ids),
            ]);
            
            return $updated;
        } catch (\Throwable $e) {
            Log::error('Stock sync failed', [
                'error' => $e->getMessage(),
                'products_count' => count($ids),
            ]);
            return 0;
        }
    }

    /**
     * Clear product-related caches
     * 
     * @param array $productIds Optional specific product IDs to clear
     */
    private static function clearProductCaches(array $productIds = []): void
    {
        // Clear general product caches
        Cache::forget('products.oversell.incidences.full');
        Cache::forget('products.oversell.incidences.count');
        Cache::forget('product_types.sort_order');
        
        // Clear specific product caches if IDs provided
        if (!empty($productIds)) {
            foreach ($productIds as $productId) {
                static::clearProductSpecificCache($productId);
            }
        }
    }

    /**
     * Clear cache for a specific product
     * 
     * @param int $productId Product ID to clear cache for
     */
    public static function clearProductSpecificCache(int $productId): void
    {
        $grupo = config('warehouse.group_clave');
        $almacenId = (int) config('warehouse.stock_almacen_id', 1);
        
        Cache::forget('wh:price:' . ($grupo ?: 'ALL') . ':' . $productId);
        Cache::forget('wh:stock:almacen:' . $almacenId . ':' . $productId);
    }
}