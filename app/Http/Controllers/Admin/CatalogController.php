<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Catalog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CatalogController extends Controller
{
    /**
     * Mostrar listado de catálogos
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $query = Catalog::query()->orderBy('order');
        
        if ($search) {
            $query->where('title', 'like', "%{$search}%");
        }
        
        $catalogs = $query->get();
        
        return Inertia::render('Admin/CatalogAdmin', [
            'catalogs' => $catalogs,
            'filters' => [
                'search' => $search,
            ]
        ]);
    }
    
    /**
     * Mostrar formulario para crear un nuevo catálogo
     */
    public function create()
    {
        return Inertia::render('Admin/CatalogForm');
    }
    
    /**
     * Almacenar un nuevo catálogo
     */
    public function store(Request $request)
    {
        
        $rules = [
            'title' => 'required|string|max:255',
            'alt' => 'required|string|max:255',
            'url' => 'nullable|string|max:255',
            'active' => 'boolean',
            'order' => 'integer',
        ];
        if ($request->hasFile('image')) {
            $rules['image'] = 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048';
        } else {
            $rules['image'] = 'required|url|max:2048';
        }

        $validated = $request->validate($rules);

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('public/catalogs');
            $validated['image'] = Storage::url($imagePath);
        }
        
        if (!isset($validated['order'])) {
            $validated['order'] = Catalog::max('order') + 1;
        }
        
        Catalog::create($validated);
        
        return redirect()->route('admin.catalogs.index')
            ->with('success', 'Catálogo creado correctamente');
    }
    
    /**
     * Mostrar formulario para editar un catálogo
     */
    public function edit($id)
    {
        $catalog = Catalog::findOrFail($id);
        
        return Inertia::render('Admin/CatalogForm', [
            'catalog' => $catalog,
            'isEdit' => true
        ]);
    }
    
    /**
     * Actualizar un catálogo existente
     */
    public function update(Request $request, $id)
    {
        $catalog = Catalog::findOrFail($id);
        
        // Reglas que permiten imagen por URL o archivo subido
        $rules = [
            'title' => 'required|string|max:255',
            'alt' => 'required|string|max:255',
            'url' => 'nullable|string|max:255',
            'active' => 'boolean',
            'order' => 'integer',
        ];
        if ($request->hasFile('image')) {
            $rules['image'] = 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048';
        } else {
            $rules['image'] = 'nullable|url|max:2048';
        }

        $validated = $request->validate($rules);

        // Procesar y guardar la nueva imagen si se proporcionó archivo
        if ($request->hasFile('image')) {
            // Eliminar la imagen antigua solo si es una ruta local (no URL externa)
            if ($catalog->image && !Str::startsWith($catalog->image, ['http://', 'https://'])) {
                Storage::delete(str_replace('/storage', 'public', $catalog->image));
            }
            $imagePath = $request->file('image')->store('public/catalogs');
            $validated['image'] = Storage::url($imagePath);
        }
        
        $catalog->update($validated);
        
        return redirect()->route('admin.catalogs.index')
            ->with('success', 'Catálogo actualizado correctamente');
    }
    
    /**
     * Eliminar un catálogo
     */
    public function destroy($id)
    {
        $catalog = Catalog::findOrFail($id);
        
        // Eliminar la imagen solo si es un archivo local
        if ($catalog->image && !Str::startsWith($catalog->image, ['http://', 'https://']) && !Str::startsWith($catalog->image, '/images/')) {
            Storage::delete(str_replace('/storage', 'public', $catalog->image));
        }
        
        $catalog->delete();
        
        return redirect()->route('admin.catalogs.index')
            ->with('success', 'Catálogo eliminado correctamente');
    }
    
    /**
     * Cambiar el estado activo/inactivo del catálogo   
     */
    public function toggleActive($id)
    {
        $catalog = Catalog::findOrFail($id);
        $catalog->active = !$catalog->active;
        $catalog->save();
        
        return redirect()->back()
            ->with('success', 'Estado del catálogo actualizado');
    }
    
    /**
     * Reordenar catálogos
     */
    public function reorder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'catalogs' => 'required|array',
            'catalogs.*.id_catalog' => 'required|exists:catalogs,id_catalog',
            'catalogs.*.order' => 'required|integer|min:0',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        foreach ($request->catalogs as $catalogData) {
            Catalog::where('id_catalog', $catalogData['id_catalog'])
                ->update(['order' => $catalogData['order']]);
        }
        
        return response()->json(['success' => true]);
    }

        public function showPublic()
    {
        $catalogs = Catalog::where('active', true)
                        ->orderBy('order')
                        ->get();
                        
        return response()->json($catalogs);
    }
}