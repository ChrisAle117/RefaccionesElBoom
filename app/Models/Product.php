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
        'name',
        'code',
        'description',
        'price',
        'disponibility',
        'reserved_stock',
        'type',
        'image',
        'audio_path',
        'active',
        'weight',
        'length',
        'width',
        'height',
        // Variant/grouping fields (optional in DB)
        'variant_group',
        'variant_group_opt_out',
        'variant_color_hex',
        'variant_color_label',
    ];

    protected $casts = [
        'id_product'     => 'integer',
        'price'          => 'float',
        'disponibility'  => 'integer',
        'reserved_stock' => 'integer',
        'active'         => 'boolean',
        'weight'         => 'float',
        'length'         => 'float',
        'width'          => 'float',
        'height'         => 'float',
        'variant_group_opt_out' => 'boolean',
    ];

    protected static array $livePriceBuffer = [];
    protected static array $liveStockBuffer = [];

    private const MISS = '__MISS__';

    protected static function boot()
    {
        parent::boot();
    }

    public static function primePrices($products): void
    {
        if ($products instanceof Collection) {
            $ids = $products->pluck('id_product')->filter()->unique()->values()->all();
        } else {
            $ids = collect($products)->map(function ($p) {
                return is_object($p) ? ($p->id_product ?? null) : $p;
            })->filter()->unique()->values()->all();
        }

        $pending = array_values(array_diff($ids, array_keys(static::$livePriceBuffer)));
        if (empty($pending)) return;

        $map = static::fetchPriceMap($pending);
        static::$livePriceBuffer = static::$livePriceBuffer + $map;
    }

    public function getPriceAttribute($localValue)
    {
        $id = $this->getAttribute('id_product');
        if (!$id) return $localValue;

        if (array_key_exists($id, static::$livePriceBuffer)) {
            $price = static::$livePriceBuffer[$id];
            return $price !== null ? (float) $price : $this->fallbackPrice($localValue);
        }

        $map = static::fetchPriceMap([$id]);
        static::$livePriceBuffer = static::$livePriceBuffer + $map;

        $price = static::$livePriceBuffer[$id] ?? null;
        return $price !== null ? (float) $price : $this->fallbackPrice($localValue);
    }

    protected function fallbackPrice($localValue)
    {
        return env('WAREHOUSE_FALLBACK_LOCAL', true) ? $localValue : null;
    }

    public static function primeStock($products): void
    {
        if ($products instanceof Collection) {
            $ids = $products->pluck('id_product')->filter()->unique()->values()->all();
        } else {
            $ids = collect($products)->map(function ($p) {
                return is_object($p) ? ($p->id_product ?? null) : $p;
            })->filter()->unique()->values()->all();
        }

        $pending = array_values(array_diff($ids, array_keys(static::$liveStockBuffer)));
        if (empty($pending)) return;

        $map = static::fetchStockMap($pending);
        static::$liveStockBuffer = static::$liveStockBuffer + $map;
    }

    public function getDisponibilityAttribute($localValue)
    {
        if (!env('WAREHOUSE_STOCK_USE_REMOTE', false)) {
            return (int) $localValue;
        }

        $id = $this->getAttribute('id_product');
        if (!$id) return (int) $localValue;

        if (array_key_exists($id, static::$liveStockBuffer)) {
            $stock = static::$liveStockBuffer[$id];
            return $stock !== null ? (int) $stock : $this->fallbackStock($localValue);
        }

        $map = static::fetchStockMap([$id]);
        static::$liveStockBuffer = static::$liveStockBuffer + $map;

        $stock = static::$liveStockBuffer[$id] ?? null;
        return $stock !== null ? (int) $stock : $this->fallbackStock($localValue);
    }

    protected function fallbackStock($localValue)
    {
        return env('WAREHOUSE_STOCK_FALLBACK_LOCAL', false) ? $localValue : 0;
    }

    protected static function fetchPriceMap(array $ids): array
    {
        $ids = array_values(array_unique(array_filter($ids, fn ($v) => $v !== null)));
        if (empty($ids)) return [];

        $ttl   = (int) env('WAREHOUSE_PRICE_TTL', 1800);
        $grupo = env('WAREHOUSE_GROUP_CLAVE');

        $result  = [];
        $pending = [];

        foreach ($ids as $id) {
            $key = 'wh:price:' . ($grupo ?: 'ALL') . ':' . $id;
            if (Cache::has($key)) {
                $val = Cache::get($key);
                $result[$id] = ($val === self::MISS) ? null : $val;
            } else {
                $pending[] = $id;
            }
        }
        if (empty($pending)) return $result;

        $codesById = self::query()
            ->whereIn('id_product', $pending)
            ->pluck('code', 'id_product')
            ->toArray();

        foreach (array_chunk($pending, 500) as $chunkIds) {
            $chunkCodes = [];
            foreach ($chunkIds as $pid) {
                $code = $codesById[$pid] ?? null;
                if ($code) $chunkCodes[$pid] = $code;
                else {
                    $result[$pid] = null;
                    Cache::put('wh:price:' . ($grupo ?: 'ALL') . ':' . $pid, self::MISS, $ttl);
                }
            }

            if (empty($chunkCodes)) {
                continue;
            }

            try {
                $rows = DB::connection('warehouse')
                    ->table('inv_articulo as ia')
                    ->join('inv_articulo_precio_grupo_almacenes as iapga', 'iapga.articulo_id', '=', 'ia.id')
                    ->join('inv_almacen_grupo as iag', 'iag.id', '=', 'iapga.grupo_id')
                    ->whereIn('ia.codigo', array_values($chunkCodes))
                    ->where('iapga.precio', '<>', 0)
                    ->when($grupo, fn ($q) => $q->where('iag.clave', $grupo))
                    ->selectRaw('ia.codigo as codigo, MIN(ROUND((iapga.precio * 1.16), 2)) as precio_publico')
                    ->groupBy('ia.codigo')
                    ->get();

                $priceByCode = [];
                foreach ($rows as $r) {
                    $priceByCode[$r->codigo] = $r->precio_publico !== null ? (float) $r->precio_publico : null;
                }

                foreach ($chunkCodes as $pid => $code) {
                    $price = $priceByCode[$code] ?? null;
                    $result[$pid] = $price;
                    Cache::put('wh:price:' . ($grupo ?: 'ALL') . ':' . $pid, $price ?? self::MISS, $ttl);
                }

                foreach ($chunkCodes as $pid => $code) {
                    if (!array_key_exists($code, $priceByCode)) {
                        $result[$pid] = null;
                        Cache::put('wh:price:' . ($grupo ?: 'ALL') . ':' . $pid, self::MISS, $ttl);
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('Warehouse price fetch failed (by code)', [
                    'error' => $e->getMessage(),
                    'ids'   => $chunkIds,
                ]);
                foreach ($chunkCodes as $pid => $_) {
                    $result[$pid] = null;
                }
            }
        }

        return $result;
    }

    protected static function fetchStockMap(array $ids): array
    {
        $ids = array_values(array_unique(array_filter($ids, fn ($v) => $v !== null)));
        if (empty($ids)) return [];

        $ttl       = (int) env('WAREHOUSE_STOCK_TTL', 300);
        $almacenId = (int) env('WAREHOUSE_STOCK_ALMACEN_ID', 1);

        $result  = [];
        $pending = [];

        foreach ($ids as $id) {
            $key = 'wh:stock:almacen:' . $almacenId . ':' . $id;
            if (Cache::has($key)) {
                $val = Cache::get($key);
                $result[$id] = ($val === self::MISS) ? null : $val;
            } else {
                $pending[] = $id;
            }
        }
        if (empty($pending)) return $result;

        try {
            foreach (array_chunk($pending, 1000) as $chunkIds) {
                $rows = DB::connection('warehouse')
                    ->table('inv_existencia as ie')
                    ->selectRaw('ie.inv_articulo_id as id, SUM(ie.cantidad_existencia) as existencia')
                    ->where('ie.inv_almacen_id', $almacenId)
                    ->whereIn('ie.inv_articulo_id', $chunkIds)
                    ->groupBy('ie.inv_articulo_id')
                    ->get();

                $byId = [];
                foreach ($rows as $r) {
                    $byId[(int) $r->id] = (int) ($r->existencia ?? 0);
                }

                foreach ($chunkIds as $pid) {
                    $key = 'wh:stock:almacen:' . $almacenId . ':' . $pid;
                    if (array_key_exists($pid, $byId)) {
                        $val = $byId[$pid];
                        $result[$pid] = $val;
                        Cache::put($key, $val, $ttl);
                    } else {
                        $result[$pid] = 0;
                        Cache::put($key, 0, $ttl);
                    }
                }

                if (env('WAREHOUSE_STOCK_AUTO_SYNC_LOCAL', false)) {
                    foreach ($chunkIds as $pid) {
                        $stock = $result[$pid] ?? 0;
                        try {
                            DB::table('products')
                                ->where('id_product', $pid)
                                ->update(['disponibility' => (int) $stock]);
                        } catch (\Throwable $e) {
                            Log::warning('Auto-sync local stock failed', [
                                'id_product' => $pid,
                                'error' => $e->getMessage(),
                            ]);
                        }
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Warehouse stock fetch failed', [
                'error' => $e->getMessage(),
                'ids'   => $pending,
            ]);
            foreach ($pending as $pid) {
                $result[$pid] = null;
            }
        }

        return $result;
    }

    public static function syncLocalStock($productsOrIds): void
    {
        if ($productsOrIds instanceof Collection) {
            $ids = $productsOrIds->pluck('id_product')->filter()->unique()->values()->all();
        } else {
            $ids = collect($productsOrIds)->map(function ($p) {
                return is_object($p) ? ($p->id_product ?? null) : $p;
            })->filter()->unique()->values()->all();
        }
        if (empty($ids)) return;

        $map = static::fetchStockMap($ids);
        if (empty($map)) return;

        foreach (array_chunk($map, 500, true) as $chunk) {
            foreach ($chunk as $pid => $stock) {
                try {
                    DB::table('products')
                        ->where('id_product', $pid)
                        ->update(['disponibility' => (int) ($stock ?? 0)]);
                } catch (\Throwable $e) {
                    Log::warning('Local stock sync failed for product', [
                        'id_product' => $pid,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        }
    }

    public function getAudioUrlAttribute(): ?string
    {
        $path = (string) ($this->attributes['audio_path'] ?? '');
        if ($path === '') return null;
        try {
            return \Illuminate\Support\Facades\Storage::url($path);
        } catch (\Throwable $e) {
            return null;
        }
    }
}
