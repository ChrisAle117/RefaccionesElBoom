<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductFamilyController extends Controller
{
    private function computeFamily(Product $p): string
    {
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
                foreach ($tokens3 as $t) { if (str_ends_with($up, $t)) { $up = substr($up, 0, -strlen($t)); $changed = true; break; } }
                if ($changed) continue;
                foreach ($tokens2 as $t) { if (str_ends_with($up, $t)) { $up = substr($up, 0, -strlen($t)); $changed = true; break; } }
                if ($changed) continue;
                foreach ($tokens1 as $t) { if (str_ends_with($up, $t)) { $up = substr($up, 0, -strlen($t)); $changed = true; break; } }
            }
            return $up !== '' ? $up : $s;
        };
    $type = (string) ($p->type ?? '');
    $vg = trim((string) ($p->variant_group ?? ''));
    if ($vg !== '') return $type . '|' . $vg; 
        if ($p->variant_group_opt_out) return 'single:' . $p->id_product;
        $code = (string) ($p->code ?? '');
        if ($code === '') return 'single:' . $p->id_product;
        
        $lastPos = -1;
        foreach (['/', '-', '\\'] as $delim) {
            $pos = strrpos($code, $delim);
            if ($pos !== false && $pos > $lastPos) $lastPos = $pos;
        }
        $prefix = $lastPos >= 0 ? substr($code, 0, $lastPos) : $code;
        $base = $stripColorSuffix($prefix);
        if ($base === $prefix) {
            if (preg_match('/^[A-Z]+\d+/', strtoupper($prefix), $m)) $base = $m[0];
        }
        return ($base !== '' && $base !== $code) ? ($type . '|' . $base) : ('single:' . $p->id_product);
    }

    public function index(Request $request)
    {
    $q = Product::query()->select(['id_product','name','code','type','disponibility','variant_group','variant_group_opt_out','variant_color_hex','variant_color_label'])
            ->when($request->filled('search'), function ($qry) use ($request) {
                $s = $request->get('search');
                $qry->where(function ($qq) use ($s) {
                    $qq->where('name','like',"%$s%")
                    ->orWhere('code','like',"%$s%")
                    ->orWhere('variant_group','like',"%$s%");
                });
            });

        $items = $q->get();

        $families = [];
        foreach ($items as $p) {
            $key = $this->computeFamily($p);
            if (!isset($families[$key])) $families[$key] = [];
            $families[$key][] = [
                'id_product' => (int) $p->id_product,
                'name' => $p->name,
                'code' => $p->code,
                'disponibility' => (int) $p->disponibility,
                'variant_group' => $p->variant_group,
                'opt_out' => (bool) $p->variant_group_opt_out,
                'color_hex' => $p->variant_color_hex,
                'color_label' => $p->variant_color_label,
            ];
        }

        ksort($families);
        $resultAll = [];
        foreach ($families as $key => $prods) {
            $count = count($prods);
            if ($count < 2) continue; 
            $sepPos = strpos($key, '|');
            $t = $sepPos !== false ? substr($key, 0, $sepPos) : '';
            $base = $sepPos !== false ? substr($key, $sepPos + 1) : $key;
            $resultAll[] = [
                'key' => $key,
                'type' => $t,
                'base' => $base,
                'count' => $count,
                'products' => array_values($prods),
            ];
        }

        
        $typeOptions = array_values(array_unique(array_map(fn($r) => (string) ($r['type'] ?? ''), $resultAll)));
        sort($typeOptions, SORT_NATURAL | SORT_FLAG_CASE);

        $typeFilter = (string) $request->get('type', '');
        $result = $resultAll;
        if ($typeFilter !== '') {
            $result = array_values(array_filter($resultAll, fn($r) => ($r['type'] ?? '') === $typeFilter));
        }

        
        usort($result, function ($a, $b) {
            $cmp = ($b['count'] <=> $a['count']);
            if ($cmp !== 0) return $cmp;
            return strcmp((string)$a['key'], (string)$b['key']);
        });

        return Inertia::render('Admin/ProductFamilies', [
            'families' => $result,
            'typeOptions' => $typeOptions,
            'filters' => [ 'search' => $request->get('search'), 'type' => $typeFilter ]
        ]);
    }

    public function assign(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|integer|exists:products,id_product',
            'family'     => 'required|string|max:255',
        ]);
        
        $familyParam = (string) $data['family'];
        $base = $familyParam;
        $pipe = strpos($familyParam, '|');
        if ($pipe !== false) {
            $base = substr($familyParam, $pipe + 1);
        }
        $p = Product::findOrFail($data['product_id']);
        $p->variant_group = $base;
        $p->variant_group_opt_out = false;
        $p->save();
        return back()->with('success','Producto asignado a la familia');
    }

    public function clear(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|integer|exists:products,id_product',
        ]);
        $p = Product::findOrFail($data['product_id']);
        $p->variant_group = null;
        $p->variant_group_opt_out = true;
        $p->save();
        return back()->with('success','Producto excluido de la agrupación automática');
    }

    public function optOut(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|integer|exists:products,id_product',
            'opt_out'    => 'required|boolean',
        ]);
        $p = Product::findOrFail($data['product_id']);
        $p->variant_group_opt_out = $data['opt_out'];
        if ($data['opt_out']) $p->variant_group = null;
        $p->save();
        return back()->with('success','Preferencia actualizada');
    }

    public function setColor(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|integer|exists:products,id_product',
            'color_hex'  => 'nullable|string|max:32',
            'color_label'=> 'nullable|string|max:100',
        ]);
        $p = Product::findOrFail($data['product_id']);
        $p->variant_color_hex = $data['color_hex'] !== '' ? $data['color_hex'] : null;
        $p->variant_color_label = $data['color_label'] !== '' ? $data['color_label'] : null;
        $p->save();
        return back()->with('success','Color de variante actualizado');
    }

    public function show(Request $request)
    {
        $key = (string) $request->get('key', '');
        if ($key === '') {
            return redirect()->route('admin.product-families.index');
        }

        $members = Product::query()
            ->select(['id_product','name','code','type','disponibility','variant_group','variant_group_opt_out','image','variant_color_hex','variant_color_label'])
            ->get()
            ->filter(function ($p) use ($key) {
                
                return $this->computeFamily($p) === $key;
            })
            ->values();
        $search = (string) $request->get('search', '');
        $poolQ = Product::query()->select(['id_product','name','code','type','disponibility','image'])
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($qq) use ($search) {
                    $qq->where('name','like',"%$search%")
                    ->orWhere('code','like',"%$search%");
                });
            });

        if ($members->isNotEmpty()) {
            $excludeIds = $members->pluck('id_product')->all();
            $poolQ->whereNotIn('id_product', $excludeIds);
        }

        
        $sepPos = strpos($key, '|');
        $type = $sepPos !== false ? substr($key, 0, $sepPos) : '';
        $base = $sepPos !== false ? substr($key, $sepPos + 1) : $key;

        
        if ($type !== '') {
            $poolQ->where('type', $type);
        }

        $pool = $poolQ->orderBy('name')->limit(100)->get();

        return Inertia::render('Admin/ProductFamilyDetail', [
            'familyKey' => $key,
            'type' => $type,
            'base' => $base,
            'members' => $members->map(function ($p) {
                return [
                    'id_product' => (int) $p->id_product,
                    'name' => (string) $p->name,
                    'code' => (string) $p->code,
                    'disponibility' => (int) $p->disponibility,
                    'image' => $p->image,
                    'variant_color_hex' => $p->variant_color_hex,
                    'variant_color_label' => $p->variant_color_label,
                ];
            }),
            'pool' => $pool->map(function ($p) {
                return [
                    'id_product' => (int) $p->id_product,
                    'name' => (string) $p->name,
                    'code' => (string) $p->code,
                    'disponibility' => (int) $p->disponibility,
                    'image' => $p->image,
                ];
            }),
            'filters' => [ 'search' => $search ]
        ]);
    }

    public function create(Request $request)
    {
        
        $types = Product::query()
            ->select('type')
            ->distinct()
            ->pluck('type')
            ->map(fn($t) => (string) $t)
            ->all();
        sort($types, SORT_NATURAL | SORT_FLAG_CASE);

        $prefillType = (string) $request->get('type', '');
        $prefillBase = (string) $request->get('base', '');

        return Inertia::render('Admin/ProductFamilyCreate', [
            'typeOptions' => $types,
            'defaults' => [ 'type' => $prefillType, 'base' => $prefillBase ]
        ]);
    }

    public function deleteFamily(Request $request)
    {
        $data = $request->validate([
            'key' => 'required|string',
        ]);
        $key = (string) $data['key'];
        $sepPos = strpos($key, '|');
        $type = $sepPos !== false ? substr($key, 0, $sepPos) : '';
        $base = $sepPos !== false ? substr($key, $sepPos + 1) : $key;
        $items = Product::query()
            ->select(['id_product','name','code','type','variant_group','variant_group_opt_out'])
            ->get();
        $affected = 0;
        foreach ($items as $p) {
            if ($this->computeFamily($p) === $key) {
                $p->variant_group = null;
                $p->variant_group_opt_out = true;
                $p->save();
                $affected++;
            }
        }

        return back()->with('success', "Familia eliminada ($affected productos actualizados)");
    }
}
