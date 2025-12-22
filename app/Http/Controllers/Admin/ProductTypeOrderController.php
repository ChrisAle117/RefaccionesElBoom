<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class ProductTypeOrderController extends Controller
{
    const CACHE_KEY = 'product_types.sort_order';

    public function index()
    {
        $allTypes = Product::query()->select('type')->distinct()->pluck('type')->filter()->values()->all();
        $saved    = Cache::get(self::CACHE_KEY, []);

        // Build ordered list: saved first (if exists), then remaining alphabetically
        $saved = array_values(array_filter($saved, fn ($t) => in_array($t, $allTypes, true)));
        $remaining = array_values(array_diff($allTypes, $saved));
        sort($remaining, SORT_NATURAL | SORT_FLAG_CASE);
        $ordered = array_values(array_unique(array_merge($saved, $remaining)));

        return Inertia::render('Admin/ProductTypeOrder', [
            'types'       => $ordered,
            'savedOrder'  => $saved,
        ]);
    }

    public function save(Request $request)
    {
        $data = $request->validate([
            'order'   => 'required|array',
            'order.*' => 'nullable|string',
        ]);

        $order = array_values(array_filter($data['order'], fn ($v) => $v !== null && $v !== ''));
        Cache::forever(self::CACHE_KEY, $order);

        return back()->with('success', 'Orden de tipos actualizado');
    }
}
