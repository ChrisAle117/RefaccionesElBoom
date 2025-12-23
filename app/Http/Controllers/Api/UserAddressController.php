<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class UserAddressController extends Controller
{
    /**
     * Obtiene la dirección del usuario autenticado
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAddress()
    {
        try {
            $user = Auth::user();
            
            if (! $user) {
                return response()->json([
                    'success' => false, 
                    'message' => 'Usuario no autenticado'
                ]);
            }
            
            // Buscar la dirección asociada al usuario
            $address = Address::where('user_id', $user->id)->first();
            
            return response()->json([
                'success' => true,
                'address' => $address
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener la dirección: ' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * Actualiza o crea la dirección del usuario con el código postal proporcionado
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateAddress(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'codigo_postal' => 'required|string|size:5',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors'  => $validator->errors()
                ], 422);
            }
            
            $user = Auth::user();
            
            if (! $user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }
            
            $postalCode = $request->input('codigo_postal');
            
            // Buscar si el usuario ya tiene una dirección
            $address = Address::where('user_id', $user->id)->first();
            
            if ($address) {
                // Actualizar la dirección existente
                $address->codigo_postal = $postalCode;
                $address->save();
            } else {
                // Crear una nueva dirección con valores predeterminados
                $address = new Address([
                    'user_id'         => $user->id,
                    'codigo_postal'   => $postalCode,
                    'calle'           => 'Sin especificar',
                    'colonia'         => 'Sin especificar',
                    'numero_exterior' => 'S/N',
                    'ciudad'          => 'Sin especificar',
                    'estado'          => 'Sin especificar',
                    'telefono'        => 'Sin especificar'
                ]);
                $address->save();
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Código postal actualizado correctamente',
                'address' => $address
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la dirección: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtiene todas las direcciones del usuario autenticado
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAllAddresses()
    {
        try {
            $user = Auth::user();

            if (! $user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            // Obtener todas las direcciones asociadas al usuario, ocultando la dirección técnica de sucursal
            $addresses = Address::where('user_id', $user->id)
                ->where(function ($q) {
                    $q->whereNull('referencia')
                      ->orWhere('referencia', '!=', 'Recoger en sucursal');
                })
                ->where('calle', 'not like', 'Sucursal El Boom%')
                ->get();

            return response()->json([
                'success'    => true,
                'addresses' => $addresses
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las direcciones: ' . $e->getMessage()
            ], 500);
        }
    }
}
