<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Product;
use Inertia\Inertia;
use PDF;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query()->select([
            'id_product',
            'name',
            'code',
            'price',
            'description',
            'disponibility',
            'reserved_stock',
            'type',
            'image',
            'active',
        ]);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('active_status')) {
            if ($request->active_status === 'active') {
                $query->where('active', true);
            } elseif ($request->active_status === 'inactive') {
                $query->where('active', false);
            }
        }

        $totalOutOfStock = Product::where('disponibility', 0)->count();

        $query->orderBy('id_product', 'desc');


        $all = $query->get();


        \App\Models\Product::primePrices($all);
        \App\Models\Product::primeStock($all);

        $availability = $request->input('availability', 'all');
        $minPrice = $request->filled('min_price') ? (float) $request->input('min_price') : null;
        $maxPrice = $request->filled('max_price') ? (float) $request->input('max_price') : null;

        $filtered = $all->filter(function (Product $p) use ($availability, $minPrice, $maxPrice) {

            if ($availability && $availability !== 'all') {
                $stock = (int) $p->disponibility; 
                switch ($availability) {
                    case 'in_stock':
                        if (!($stock > 0)) return false;
                        break;
                    case 'low_stock':
                        if (!($stock > 0 && $stock <= 10)) return false;
                        break;
                    case 'out_of_stock':
                        if (!($stock === 0)) return false;
                        break;
                    case 'high_stock':
                        if (!($stock >= 20)) return false;
                        break;
                }
            }

            $price = $p->price; 
            if ($minPrice !== null && !($price >= $minPrice)) return false;
            if ($maxPrice !== null && !($price <= $maxPrice)) return false;

            return true;
        })->values();


        $perPage = (int) ($request->input('per_page') ?: 10);
        $currentPage = (int) ($request->input('page') ?: 1);
        $total = $filtered->count();
        $items = $filtered->slice(($currentPage - 1) * $perPage, $perPage)->values();
        $products = new LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $currentPage,
            ['path' => $request->url(), 'query' => $request->query()] 
        );


        \App\Models\Product::primePrices($products->getCollection());

        $firstModel = $products->getCollection()->first();
        $firstModelArray = $firstModel ? $firstModel->toArray() : null;
        $firstDbRow = $firstModel
            ? DB::table('products')->where('id_product', $firstModel->id_product)->select([
                'id_product','name','code','type','description','price','disponibility','reserved_stock','image','active'
            ])->first()
            : null;
        // \Log::info('admin.products MODEL first', $firstModelArray ?: []);
        // \Log::info('admin.products DB first', (array) ($firstDbRow ?: []));


        $productsArray = $products->getCollection()->map(function (Product $p) {
            $image = $p->image;

            if ($image && !Str::startsWith($image, ['http://', 'https://', '//'])) {
                try {
                    $image = Storage::url($image);
                } catch (\Throwable $e) {
                    
                }
            }

            return [
                'id_product'     => (int) $p->id_product,
                'name'           => $p->name,          
                'code'           => $p->code,          
                'price'          => $p->price,         
                'description'    => $p->description,   
                'disponibility'  => (int) $p->disponibility,
                'reserved_stock' => (int) $p->reserved_stock,
                'type'           => $p->type,          
                'image'          => $image ?: null,
                'audio_url'      => $p->audio_url,
                'active'         => (bool) $p->active,
            ];
        })->values()->all();

        // Tipos únicos para el filtro
        $types = Product::query()->select('type')->distinct()->pluck('type');

        // Log compacto para confirmar payload final
        // \Log::info('admin.products payload example', [
        //     'first_product' => $productsArray[0] ?? null,
        //     'count'         => is_array($productsArray) ? count($productsArray) : null,
        // ]);

        return Inertia::render('Admin/ProductsAdmin', [
            'products' => $productsArray,
            'filters' => [
                'search'        => $request->search,
                'type'          => $request->type,
                'availability'  => $request->availability ?? 'all',
                'min_price'     => $request->min_price,
                'max_price'     => $request->max_price,
                'active_status' => $request->active_status ?? 'all',
            ],
            'types' => $types,
            'pagination' => [
                'total'        => $products->total(),
                'per_page'     => $products->perPage(),
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
            ],
            'totalOutOfStock' => $totalOutOfStock,
        ]);
    }

    public function create()
    {
        $types = Product::query()->select('type')->distinct()->pluck('type')->filter()->values()->toArray();
        return Inertia::render('Admin/ProductForm', [
            'types' => $types
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'code'           => 'required|string|max:100|unique:products',
            'description'    => 'required|string',
            'price'          => 'required|numeric|min:0',
            'disponibility'  => 'required|integer|min:0',
            'reserved_stock' => 'required|integer|min:0',
            'type'           => 'required|string|max:100',
            'image'          => 'nullable|url|max:255',
            'weight'         => 'nullable|numeric|min:0',
            'length'         => 'nullable|numeric|min:0',
            'width'          => 'nullable|numeric|min:0',
            'height'         => 'nullable|numeric|min:0',
        ]);

        $product = new Product();
        $product->fill($validated);
        $product->save();

        return redirect()->route('admin.products')->with('success', 'Producto creado con éxito');
    }

    public function edit($id)
    {
        $product = Product::findOrFail($id);

        $types = Product::query()->select('type')->distinct()->pluck('type')->filter()->values()->toArray();

        return Inertia::render('Admin/ProductForm', [
            'product' => [
                'id_product'     => $product->id_product,
                'name'           => $product->name,
                'code'           => $product->code,
                'description'    => $product->description,
                'price'          => $product->price, 
                'disponibility'  => $product->disponibility,
                'reserved_stock' => $product->reserved_stock,
                'weight'         => $product->weight,
                'length'         => $product->length,
                'width'          => $product->width,
                'height'         => $product->height,
                'type'           => $product->type,
                'image'          => $product->image,
                'audio_url'      => $product->audio_url,
                'active'         => $product->active,
            ],
            'types' => $types
        ]);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'code'           => 'required|string|max:100|unique:products,code,' . $id . ',id_product',
            'description'    => 'required|string',
            'price'          => 'required|numeric|min:0',
            'disponibility'  => 'required|integer|min:0',
            'reserved_stock' => 'required|integer|min:0',
            'type'           => 'required|string|max:100',
            'image'          => 'nullable|url|max:255',
            'weight'         => 'nullable|numeric|min:0',
            'length'         => 'nullable|numeric|min:0',
            'width'          => 'nullable|numeric|min:0',
            'height'         => 'nullable|numeric|min:0',
        ]);

        $originalType = $product->type;
        $product->fill($validated);

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $path = $request->file('image')->store('products', 'public');
            $product->image = $path;
        }

        // If product type changed from 'bocina' to something else, remove audio
        if (strtolower((string) $originalType) === 'bocina' && strtolower((string) $product->type) !== 'bocina') {
            if ($product->audio_path) {
                try { Storage::disk('public')->delete($product->audio_path); } catch (\Throwable $e) {}
            }
            $product->audio_path = null;
        }

        // Optional inline audio upload on update
        if ($request->hasFile('audio') && strtolower((string) $product->type) === 'bocina') {
            $request->validate([
                'audio' => 'file|mimes:mp3,ogg,wav|max:10240',
            ]);
            if ($product->audio_path) {
                try { Storage::disk('public')->delete($product->audio_path); } catch (\Throwable $e) {}
            }
            $file = $request->file('audio');
            $ext = $file->getClientOriginalExtension();
            $slug = Str::slug(substr((string) $product->name ?: (string) $product->code, 0, 80));
            $filename = $slug . '-' . $product->id_product . '-' . time() . '.' . strtolower($ext ?: 'mp3');
            $path = $file->storeAs('products/audio', $filename, 'public');
            $product->audio_path = $path;
        }

        $product->save();

        // Redirigimos al listado mostrando mensaje de éxito
        return redirect()->route('admin.products')->with('success', 'Cambios guardados exitosamente');
    }

    public function uploadAudio(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $request->validate([
            'audio' => 'required|file|mimes:mp3,ogg,wav|max:10240',
        ]);

        if (strtolower((string) $product->type) !== 'bocina') {
            return back()->with('error', 'Solo productos tipo bocina pueden tener audio');
        }

        if ($product->audio_path) {
            try { Storage::disk('public')->delete($product->audio_path); } catch (\Throwable $e) {}
        }

        $file = $request->file('audio');
        $ext = $file->getClientOriginalExtension();
        $slug = Str::slug(substr((string) $product->name ?: (string) $product->code, 0, 80));
        $filename = $slug . '-' . $product->id_product . '-' . time() . '.' . strtolower($ext ?: 'mp3');
        $path = $file->storeAs('products/audio', $filename, 'public');
        $product->audio_path = $path;
        $product->save();

        return back()->with('success', 'Audio subido correctamente');
    }

    public function deleteAudio($id)
    {
        $product = Product::findOrFail($id);
        if ($product->audio_path) {
            try { Storage::disk('public')->delete($product->audio_path); } catch (\Throwable $e) {}
            $product->audio_path = null;
            $product->save();
        }
        return back()->with('success', 'Audio eliminado');
    }

    public function destroy($id)
    {
        try {
            $product = Product::where('id_product', $id)->firstOrFail();

            $hasOrders = $product->orderItems()->exists();
            if ($hasOrders) {
                return back()->with('error', 'No se puede eliminar este producto porque tiene pedidos asociados');
            }

            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }

            $result = DB::table('products')->where('id_product', $id)->delete();
            if (!$result) {
                // \Log::error("Error al eliminar producto ID {$id}: No se pudo borrar de la base de datos");
                return back()->with('error', 'Error al eliminar el producto de la base de datos');
            }

            return redirect()->route('admin.products')->with('success', 'Producto eliminado con éxito');
        } catch (\Exception $e) {
            // \Log::error("Error al eliminar producto ID {$id}: " . $e->getMessage());
            return back()->with('error', 'Ha ocurrido un error al intentar eliminar el producto: ' . $e->getMessage());
        }
    }

    public function toggleStatus($id)
    {
        try {
            $product = Product::where('id_product', $id)->firstOrFail();
            $product->active = !$product->active;
            $product->save();

            $message = $product->active ? 'Producto activado correctamente' : 'Producto desactivado correctamente';
            return redirect()->back()->with('success', $message);
        } catch (\Exception $e) {
            // \Log::error("Error al cambiar estado del producto ID {$id}: " . $e->getMessage());
            return back()->with('error', 'Error al cambiar el estado del producto');
        }
    }

    public function generateOutOfStockReport()
    {
        $products = Product::where('disponibility', 0)->get();
        $data = [
            'products' => $products,
            'dateGenerated' => now()->format('d/m/Y H:i'),
        ];

        $pdf = PDF::loadView('pdf.out_of_stock_report', $data);
        return $pdf->download('reporte-productos-sin-stock-' . now()->format('Y-m-d') . '.pdf');
    }


    public function incidences(Request $request)
    {
        $ttl = (int) env('INCIDENCES_CACHE_TTL', 60); 
        $keyFull = 'products.oversell.incidences.full';

        if ($request->boolean('fresh')) {
            \Cache::forget($keyFull);
        }

        $data = \Cache::remember($keyFull, $ttl, function () {
            $products = Product::query()->select('id_product','name','code','disponibility','active')
                ->where('disponibility','>',0)->get();
            if ($products->isEmpty()) return ['incidences'=>[], 'total'=>0];
            $ids = $products->pluck('id_product')->all();
            try {
                $ref = new \ReflectionClass(Product::class);
                $method = $ref->getMethod('fetchStockMap');
                $method->setAccessible(true);
                $remoteMap = $method->invoke(null, $ids);
            } catch (\Throwable $e) { \Log::warning('Incidences fetchStockMap reflection failed', ['error'=>$e->getMessage()]); $remoteMap = []; }
            $incidences = [];
            foreach ($products as $p) {
                $remote = (int) ($remoteMap[$p->id_product] ?? 0);
                $local  = (int) $p->disponibility;
                if ($local > $remote) {
                    $incidences[] = [
                        'id_product'   => (int)$p->id_product,
                        'name'         => $p->name,
                        'code'         => $p->code,
                        'local_stock'  => $local,
                        'remote_stock' => $remote,
                        'difference'   => $local - $remote,
                        'active'       => (bool)$p->active,
                    ];
                }
            }
            usort($incidences, fn($a,$b) => $b['difference'] <=> $a['difference']);
            return ['incidences'=>$incidences,'total'=>count($incidences)];
        });

        if ($request->wantsJson()) {
            return response()->json(['success'=>true] + $data);
        }

        return Inertia::render('Admin/ProductIncidences', $data);
    }

    public function incidencesCount()
    {
        $ttl = (int) env('INCIDENCES_CACHE_TTL', 60);
        $keyFull = 'products.oversell.incidences.full';
        $keyCount = 'products.oversell.incidences.count';

        if (\Cache::has($keyFull)) {
            $full = \Cache::get($keyFull);
            return response()->json(['success'=>true,'count'=>$full['total'] ?? 0]);
        }

        $countData = \Cache::remember($keyCount, $ttl, function () {
            $products = Product::query()->select('id_product','disponibility')->where('disponibility','>',0)->get();
            if ($products->isEmpty()) return ['total'=>0];
            $ids = $products->pluck('id_product')->all();
            try {
                $ref = new \ReflectionClass(Product::class);
                $method = $ref->getMethod('fetchStockMap');
                $method->setAccessible(true);
                $remoteMap = $method->invoke(null, $ids);
            } catch (\Throwable $e) { $remoteMap = []; }
            $count = 0;
            foreach ($products as $p) {
                $remote = (int) ($remoteMap[$p->id_product] ?? 0);
                if ((int)$p->disponibility > $remote) $count++;
            }
            return ['total'=>$count];
        });
        return response()->json(['success'=>true,'count'=>$countData['total'] ?? 0]);
    }

    public function syncStock(Request $request)
    {
        $request->validate([
            'password' => 'required|string'
        ]);

        $user = $request->user();
        if (!$user || !\Hash::check($request->password, $user->password)) {
            if ($request->expectsJson() || $request->wantsJson() || $request->boolean('json')) {
                return response()->json(['success' => false, 'error' => 'Contraseña incorrecta'], 422);
            }
            return back()->with('error', 'Contraseña incorrecta');
        }

        $ids = Product::query()->where('active', true)->pluck('id_product')->toArray();
        if (empty($ids)) {
            if ($request->expectsJson() || $request->wantsJson() || $request->boolean('json')) {
                return response()->json(['success' => true, 'message' => 'No hay productos activos para sincronizar']);
            }
            return back()->with('success', 'No hay productos activos para sincronizar');
        }

        Product::syncLocalStock($ids);

        $msg = 'Existencias sincronizadas correctamente (' . count($ids) . ' productos).';
        if ($request->expectsJson() || $request->wantsJson() || $request->boolean('json')) {
            return response()->json(['success' => true, 'message' => $msg]);
        }
        return back()->with('success', $msg);
    }

    public function syncStockIncidences(Request $request)
    {
        $request->validate(['password' => 'required|string']);
        $user = $request->user();
        if (!$user || !\Hash::check($request->password, $user->password)) {
            if ($request->expectsJson() || $request->wantsJson() || $request->boolean('json')) {
                return response()->json(['success' => false, 'error' => 'Contraseña incorrecta'], 422);
            }
            return back()->with('error', 'Contraseña incorrecta');
        }

        $products = Product::query()->select('id_product','disponibility','active')
            ->where('disponibility','>',0)->get();
        $ids = [];
        if ($products->isNotEmpty()) {
            try {
                $ref = new \ReflectionClass(Product::class);
                $method = $ref->getMethod('fetchStockMap');
                $method->setAccessible(true);
                $remoteMap = $method->invoke(null, $products->pluck('id_product')->all());
            } catch (\Throwable $e) { $remoteMap = []; }
            foreach ($products as $p) {
                $remote = (int) ($remoteMap[$p->id_product] ?? 0);
                $local  = (int) $p->disponibility;
                if ($local > $remote) { $ids[] = (int)$p->id_product; }
            }
        }
        $ids = array_values(array_unique($ids));

        if (empty($ids)) {
            if ($request->expectsJson() || $request->wantsJson() || $request->boolean('json')) {
                return response()->json(['success' => true, 'message' => 'No hay incidencias para ajustar']);
            }
            return back()->with('success', 'No hay incidencias para ajustar');
        }

        Product::syncLocalStock($ids);

        $msg = 'Existencias de incidencias sincronizadas (' . count($ids) . ' productos).';
        \Cache::forget('products.oversell.incidences.full');
        \Cache::forget('products.oversell.incidences.count');
        if ($request->expectsJson() || $request->wantsJson() || $request->boolean('json')) {
            return response()->json(['success' => true, 'message' => $msg, 'updated_ids' => $ids]);
        }
        return back()->with('success', $msg);
    }
}
