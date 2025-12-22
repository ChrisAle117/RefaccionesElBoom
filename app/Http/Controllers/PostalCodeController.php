<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PostalCodeController extends Controller
{
    public function show($cp)
    {
        $datos = DB::table('codigos_postales')
            ->where('d_codigo', $cp)
            ->get();

        if ($datos->isEmpty()) {
            return response()->json(['error' => 'No encontrado'], 404);
        }

        return response()->json([
            'estado' => $datos[0]->d_estado,
            'municipio' => $datos[0]->d_municipio,
            'colonias' => $datos->pluck('d_asenta'),
        ]);
    }
}
