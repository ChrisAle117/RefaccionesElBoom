<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FabricationQuoteController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'telefono' => 'required|string|digits:10',
            'email' => 'required|email|max:255',
            'estado' => 'required|string|max:255',
            'servicio' => 'required|string|max:255',
            'descripcion' => 'required|string|min:10',
            
            // Optional fields
            'material' => 'nullable|string|max:255',
            'espesor' => 'nullable|string|max:255',
            'dimensiones' => 'nullable|string|max:255',
            'angulo' => 'nullable|string|max:255',
            'longitud' => 'nullable|string|max:255',
            'cantidad_dobleces' => 'nullable|string|max:255',
            
            // File validation: generic 'file' rule + extensions check
            // Note: SolidWorks files might have octet-stream mime type, so extension check is safer
            'archivo' => 'nullable|file|max:10240' // Max 10MB
        ]);

        $filePath = null;
        if ($request->hasFile('archivo')) {
            $file = $request->file('archivo');
            
            // Valid extensions check (Backend enforcement)
            $validExtensions = ['sldprt', 'sldasm', 'slddrw'];
            $extension = strtolower($file->getClientOriginalExtension());
            
            if (!in_array($extension, $validExtensions)) {
                return response()->json([
                    'message' => 'El archivo debe ser formato SolidWorks (.sldprt, .sldasm, .slddrw)',
                    'errors' => ['archivo' => ['Formato no válido']]
                ], 422);
            }

            // Store file
            $filename = time() . '_' . str_replace(' ', '_', $file->getClientOriginalName());
            $filePath = $file->storeAs('quotes', $filename, 'public');
        }

        // Create Record
        $quote = \App\Models\FabricationQuote::create([
            'nombre' => $validated['nombre'],
            'apellido' => $validated['apellido'],
            'telefono' => $validated['telefono'],
            'email' => $validated['email'],
            'estado' => $validated['estado'],
            'servicio' => $validated['servicio'],
            'descripcion' => $validated['descripcion'],
            'material' => $validated['material'] ?? null,
            'espesor' => $validated['espesor'] ?? null,
            'dimensiones' => $validated['dimensiones'] ?? null,
            'angulo' => $validated['angulo'] ?? null,
            'longitud' => $validated['longitud'] ?? null,
            'cantidad_dobleces' => $validated['cantidad_dobleces'] ?? null,
            'archivo_path' => $filePath,
            'status' => 'pending'
        ]);

        // Send Email Notification
        // Configured per user request
        $adminEmail = 'elboomcel2@gmail.com'; 
        
        try {
            \Illuminate\Support\Facades\Mail::to($adminEmail)->send(new \App\Mail\FabricationQuoteRequest($quote));
        } catch (\Exception $e) {
            // Log error but don't fail the request
            \Illuminate\Support\Facades\Log::error('Error sending quote email: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Cotización enviada exitosamente',
            'id' => $quote->id
        ], 201);
    }
}
