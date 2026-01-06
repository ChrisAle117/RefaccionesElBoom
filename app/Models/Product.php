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
        if (!env('WAREHOUSE_STOCK_USE_REMOTE', false)) {
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
        return env('WAREHOUSE_FALLBACK_LOCAL', true) ? $localValue : null;
    }

    protected function fallbackStock($localValue)
    {
        return env('WAREHOUSE_STOCK_FALLBACK_LOCAL', true) ? (int)$localValue : 0;
    }

    // --- FETCH LOGIC ---

    protected static function fetchPriceMap(array $ids): array
    {
        $ids = array_values(array_unique(array_filter($ids, fn ($v) => $v !== null)));
        if (empty($ids)) return [];

        $ttl   = (int) env('WAREHOUSE_PRICE_TTL', 1800);
        $grupo = env('WAREHOUSE_GROUP_CLAVE');
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

        $ttl = (int) env('WAREHOUSE_STOCK_TTL', 300);
        $almacenId = (int) env('WAREHOUSE_STOCK_ALMACEN_ID', 1);
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

                        if (env('WAREHOUSE_STOCK_AUTO_SYNC_LOCAL', false)) {
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

    public static function primePrices($products): void { /* ... lógica de prime idéntica ... */ }
    public static function primeStock($products): void { /* ... lógica de prime idéntica ... */ }

    public function getAudioUrlAttribute(): ?string
    {
        $path = (string) ($this->attributes['audio_path'] ?? '');
        return ($path !== '') ? \Illuminate\Support\Facades\Storage::url($path) : null;
    }
}