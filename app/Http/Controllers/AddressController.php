<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Address;

use Illuminate\Support\Facades\Session;

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

        // Asigna el id del usuario autenticado al campo user_id o la session para invitados.
        if (auth()->check()) {
            $data['user_id'] = auth()->id();
        } else {
            $data['session_id'] = Session::getId();
        }

        // Guarda la dirección en la base de datos.
        try {
            Address::create($data);
            \Log::info('Address Store OK - Session ID: ' . Session::getId() . ' User ID: ' . (auth()->id() ?? 'GUEST'));
        } catch (\Exception $e) {
            \Log::error('Address Store ERROR: ' . $e->getMessage() . ' | data: ' . json_encode($data));
            return response()->json(['success' => false, 'message' => 'Error al guardar: ' . $e->getMessage()], 500);
        }

        // Retorna una respuesta JSON (evita redirect de Inertia que regenera sesión de invitado)
        return response()->json(['success' => true, 'message' => 'Direccion guardada correctamente.']);
    }

    public function index()
    {
        // Obtiene las direcciones del usuario autenticado o de la sesión
        // Oculta la dirección técnica usada para "Recoger en sucursal"
        
        $query = Address::query();

        \Log::info('Address Index CALLED - Session ID: ' . Session::getId() . ' User ID: ' . (auth()->id() ?? 'GUEST'));

        if (auth()->check()) {
            $query->where('user_id', auth()->id());
        } else {
            $query->where('session_id', Session::getId());
        }

        \Log::info('Address Index - Session ID: ' . Session::getId() . ' User ID: ' . (auth()->id() ?? 'GUEST'));

        $addresses = $query->where(function ($q) {
                $q->whereNull('referencia')
                  ->orWhere('referencia', '!=', 'Recoger en sucursal');
            })
            ->where('calle', 'not like', 'Sucursal El Boom%')
            ->get();

        \Log::info('Address Index - Session ID: ' . Session::getId() . ' FOUND: ' . $addresses->count());

        // Devuelve las direcciones en formato JSON
        return response()->json($addresses);
    }
}