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
        if ($cachedData !== null && empty($search)) {
            return Inertia::render($view, $cachedData);
        }

    $query = Product::query()->where('active', true);

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

        
        $savedOrder = Cache::get('product_types.sort_order', []);
        if (!empty($savedOrder) && is_array($savedOrder)) {
            $case = 'CASE';
            $bindings = [];
            foreach ($savedOrder as $idx => $t) {
                $case .= ' WHEN type = ? THEN ?';
                $bindings[] = $t;
                $bindings[] = $idx + 1;
            }
            $case .= ' ELSE 9999 END';
            $query->orderByRaw($case, $bindings)->orderBy('name');
        } else {
            $query->orderBy('type')->orderBy('name');
        }

        
        $products = $query->get(['*']); 

        
        Product::primePrices($products);

        
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

        $types = Product::query()
            ->select('type')
            ->where('active', true)
            ->distinct()
            ->pluck('type')
            ->toArray();
        if (!empty($types) && !empty($savedOrder)) {
            usort($types, function ($a, $b) use ($savedOrder) {
                $pa = array_search($a, $savedOrder, true);
                $pb = array_search($b, $savedOrder, true);
                $oa = $pa === false ? 9999 : $pa;
                $ob = $pb === false ? 9999 : $pb;
                if ($oa === $ob) return strcmp((string) $a, (string) $b);
                return $oa <=> $ob;
            });
        } else {
            sort($types, SORT_NATURAL | SORT_FLAG_CASE);
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
