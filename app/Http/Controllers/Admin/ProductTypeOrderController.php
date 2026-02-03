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

        // Limpiar cachés de listado de productos para que los cambios se vean de inmediato
        // Se limpian las versiones base de welcome y dashboard (sin filtros de búsqueda/tipo)
        Cache::forget('products_listing_welcome_' . md5(''));
        Cache::forget('products_listing_dashboard_' . md5(''));

        return back()->with('success', 'Orden de tipos actualizado');
    }
}
