<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Address;

class AddressController extends Controller
{
    public function store(Request $request)
    {
        // Valida los datos recibidos
        $data = $request->validate([
            'calle'          => 'required|string|max:255',
            'colonia'        => 'required|string|max:255',
            'numero_exterior' => 'nullable|string|max:50',
            'numero_interior' => 'nullable|string|max:50',
            'codigo_postal'  => 'required|string|max:20',
            'estado'         => 'required|string|max:255',
            'ciudad'         => 'required|string|max:255',
            'telefono'       => 'required|string|max:20',
            'referencia'     => 'nullable|string|max:255',
        ]);

        // Asigna el id del usuario autenticado al campo user_id.
        $data['user_id'] = auth()->id();

        // Guarda la dirección en la base de datos.
        Address::create($data);

        // Retorna una respuesta
        return redirect()->back()->with('success', 'Dirección guardada correctamente.');
    }

    public function index()
    {
        // Obtiene las direcciones del usuario autenticado
        // Oculta la dirección técnica usada para "Recoger en sucursal"
        $addresses = Address::where('user_id', auth()->id())
            ->where(function ($q) {
                $q->whereNull('referencia')
                  ->orWhere('referencia', '!=', 'Recoger en sucursal');
            })
            ->where('calle', '!=', 'Sucural El Boom Alpuyeca')
            ->get();

        // Devuelve las direcciones en formato JSON
        return response()->json($addresses);
    }
}