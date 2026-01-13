<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;

class ProductListingController extends Controller
{

    public function welcome(Request $request)
    {
        return $this->renderListing($request, 'welcome');
    }

    public function dashboard(Request $request)
    {
        return $this->renderListing($request, 'dashboard');
    }

    private function renderListing(Request $request, string $view)
    {
        $search = (string) ($request->input('search') ?? '');
        $type   = (string) ($request->input('type') ?? '');

        // Crear una clave de caché basada en los parámetros de búsqueda
        $cacheKey = "products_listing_{$view}_" . md5($search . $type);
        $cacheDuration = 300; // 5 minutos

        // Intentar obtener desde caché
        $cachedData = Cache::get($cacheKey);
        // Si hay búsqueda o tipo, ignoramos caché para asegurar frescura en filtros dinámicos
        if ($cachedData !== null && empty($search) && empty($type)) {
            return Inertia::render($view, $cachedData);
        }

        $query = Product::query()
            ->where('active', true)
            ->where('disponibility', '>', 0)
            ->where('name', '!=', 'name')
            ->whereRaw("COALESCE( NULLIF(created_at, '0000-00-00 00:00:00'), NULLIF(updated_at, '0000-00-00 00:00:00') ) >= ?", ['2023-01-01'])
            ->orderBy('id_product', 'desc');

        if ($search !== '') {
            $keywords = preg_split('/\s+/', $search, -1, PREG_SPLIT_NO_EMPTY) ?: [];
            $query->where(function ($q) use ($keywords) {
                foreach ($keywords as $keyword) {
                    $q->orWhere('name', 'like', "%$keyword%")
                    ->orWhere('description', 'like', "%$keyword%")
                    ->orWhere('code', 'like', "%$keyword%")
                    ->orWhere('type', 'like', "%$keyword%");
                }
            });
        }

        if ($type !== '') {
            $query->where('type', $type);
        }

        
        // Orden solicitado por el usuario: plafon, cubretuerca, faroled, modulo led, bocina, otros
        $defaultOrder = ['plafon', 'cubretuerca', 'faroled', 'modulo-led', 'bocina', 'otros'];
        
        $savedOrder = Cache::get('product_types.sort_order', $defaultOrder);
        
        if (!empty($savedOrder) && is_array($savedOrder)) {
            // Normalizar el orden guardado/default para comparación
            $normalizedOrder = array_map(fn($t) => strtolower(trim((string)$t)), $savedOrder);
            
            $case = 'CASE';
            $bindings = [];
            foreach ($normalizedOrder as $idx => $t) {
                // Manejar variaciones comunes para asegurar que el orden se aplique correctamente
                if ($t === 'faroled' || $t === 'faro-led') {
                    $case .= ' WHEN LOWER(type) = ? OR LOWER(type) = ? THEN ?';
                    $bindings[] = 'faroled';
                    $bindings[] = 'faro-led';
                } elseif ($t === 'modulo led' || $t === 'modulo-led' || $t === 'modulos-led') {
                    $case .= ' WHEN LOWER(type) = ? OR LOWER(type) = ? OR LOWER(type) = ? THEN ?';
                    $bindings[] = 'modulo led';
                    $bindings[] = 'modulo-led';
                    $bindings[] = 'modulos-led';
                } else {
                    $case .= ' WHEN LOWER(type) = ? THEN ?';
                    $bindings[] = $t;
                }
                $bindings[] = $idx + 1;
            }
            $case .= ' ELSE 9999 END';
            $query->orderByRaw($case, $bindings)->orderBy('name');
        } else {
            $query->orderBy('type')->orderBy('name');
        }

        
        $products = $query->get(['*']); 


        Product::primePrices($products);
        // Se elimina primeStock para priorizar el dato local de disponibilidad
        // Filtrar productos que realmente tienen stock (priorizando dato local si está configurado)
        $products = $products->filter(fn($p) => $p->disponibility > 0);

        
        $groups = [];

        
    $stripColorSuffix = function (string $s): string {
            $up = strtoupper(trim($s));
            if ($up === '') return $up;
            
            if (!preg_match('/\d/', $up)) return $up;

            $tokens3 = ['ICE'];
            $tokens2 = ['WH','BK','BL','BU','GN','RD','YL','AM','OR','GY','GR','CY','AQ','NV','PN','PU','PK','AZ','RO','VE','NE','NA','MO'];
            $tokens1 = ['W','K','B','G','R','Y','O','P','N','V'];

            $changed = true;
            while ($changed) {
                $changed = false;
                foreach ($tokens3 as $t) {
                    if (str_ends_with($up, $t)) { $up = substr($up, 0, -strlen($t)); $changed = true; break; }
                }
                if ($changed) continue;
                foreach ($tokens2 as $t) {
                    if (str_ends_with($up, $t)) { $up = substr($up, 0, -strlen($t)); $changed = true; break; }
                }
                if ($changed) continue;
                foreach ($tokens1 as $t) {
                    if (str_ends_with($up, $t)) { $up = substr($up, 0, -strlen($t)); $changed = true; break; }
                }
            }

            
            return $up !== '' ? $up : $s;
        };

        $familyOf = function ($p) use ($stripColorSuffix) {
            $type = (string) ($p->type ?? '');
            $variantGroup = trim((string) ($p->variant_group ?? ''));
            if ($variantGroup !== '') return $type . '|' . $variantGroup;
            $optOut = (bool) ($p->variant_group_opt_out ?? false);
            if ($optOut) return 'single:' . $p->id_product;
            $code = (string) ($p->code ?? '');
            if ($code === '') return 'single:' . $p->id_product;
            
            $delims = ['/', '-', '\\'];
            $lastPos = -1;
            foreach ($delims as $d) {
                $pos = strrpos($code, $d);
                if ($pos !== false && $pos > $lastPos) $lastPos = $pos;
            }
            $prefix = $lastPos >= 0 ? substr($code, 0, $lastPos) : $code;
            $base = $stripColorSuffix($prefix);
            
            if ($base === $prefix) {
                if (preg_match('/^[A-Z]+\d+/', strtoupper($prefix), $m)) {
                    $base = $m[0];
                }
            }
            return $base !== '' ? ($type . '|' . $base) : ('single:' . $p->id_product);
        };

        foreach ($products as $p) {
            $key = $familyOf($p);
            if (!isset($groups[$key])) $groups[$key] = [];
            $groups[$key][] = $p;
        }

        
    $toRender = collect();
        foreach ($groups as $key => $items) {
            $coll = collect($items);
            
            $rep = $coll->sortByDesc(fn($x) => (int) ($x->disponibility > 0))
                    ->sortBy('id_product')
                    ->first();

            $variants = $coll->map(function ($x) {
                $colorHex = trim((string) ($x->variant_color_hex ?? ''));
                $colorLbl = trim((string) ($x->variant_color_label ?? ''));
                if ($colorLbl === '') {
                    $code = (string) ($x->code ?? '');
                    $last = '';
                    if ($code !== '') {
                        $delims = ['/', '-', '\\'];
                        $lastPos = -1;
                        foreach ($delims as $d) {
                            $pos = strrpos($code, $d);
                            if ($pos !== false && $pos > $lastPos) $lastPos = $pos;
                        }
                        $last = $lastPos !== false && $lastPos >= 0 ? substr($code, $lastPos + 1) : $code;
                    }
                    $colorLbl = $last ?: 'Variante';
                }
                return [
                    'id_product'   => (int) $x->id_product,
                    'code'         => $x->code,
                    'name'         => $x->name,
                    'description'  => $x->description,
                    'price'        => $x->price,
                    'image'        => $x->image,
                    'audio_url'    => $x->audio_url ?? null,
                    'disponibility'=> (int) $x->disponibility,
                    'color_hex'    => $colorHex,
                    'color_label'  => $colorLbl,
                ];
            })->values()->all();

            
            $toRender->push([
                'id_product'    => (int) $rep->id_product,
                'name'          => $rep->name,
                'price'         => $rep->price,
                'description'   => $rep->description,
                'disponibility' => (int) $rep->disponibility,
                'image'         => $rep->image,
                'active'        => (bool) $rep->active,
                'type'          => $rep->type,
                'code'          => $rep->code,
                'audio_url'     => $rep->audio_url ?? null,
                'variants'      => $variants,
            ]);
        }

        // Obtener tipos de producto ÚNICAMENTE de los productos que pasaron el filtro de stock y edad
        $types = $toRender->pluck('type')->unique()->filter()->values()->toArray();
        
        $currentOrder = !empty($savedOrder) ? $savedOrder : $defaultOrder;
        $normalizedCurrentOrder = array_map(fn($t) => strtolower(trim((string)$t)), $currentOrder);

        if (!empty($types)) {
            usort($types, function ($a, $b) use ($normalizedCurrentOrder) {
                $ta = strtolower(trim((string)$a));
                $tb = strtolower(trim((string)$b));
                
                // Helper para encontrar la posición considerando alias
                $findPos = function($type) use ($normalizedCurrentOrder) {
                    $pos = array_search($type, $normalizedCurrentOrder, true);
                    if ($pos !== false) return $pos;
                    
                    // Manejar alias si no se encuentra exacto
                    if ($type === 'faro-led') return array_search('faroled', $normalizedCurrentOrder, true);
                    if ($type === 'faroled') return array_search('faro-led', $normalizedCurrentOrder, true);
                    if ($type === 'modulo-led' || $type === 'modulos-led') return array_search('modulo led', $normalizedCurrentOrder, true);
                    
                    return false;
                };

                $pa = $findPos($ta);
                $pb = $findPos($tb);
                
                $oa = $pa === false ? 9999 : $pa;
                $ob = $pb === false ? 9999 : $pb;
                
                if ($oa === $ob) return strcmp((string) $a, (string) $b);
                return $oa <=> $ob;
            });
        }
        $productTypes = collect($types);

        $renderData = [
            'products'     => $toRender->values()->all(),
            'search'       => $search,
            'type'         => $type,
            'productTypes' => $productTypes,
        ];

        // Cachear si no hay búsqueda activa
        if (empty($search)) {
            Cache::put($cacheKey, $renderData, $cacheDuration);
        }

        return Inertia::render($view, $renderData);
    }
}
