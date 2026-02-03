<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FabricationQuoteController extends Controller
{
    public function store(Request $request)
    {
        // Increase detailed logging and timeout
        set_time_limit(120); 
        
        try {
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
                
                // File validation
                'archivo' => 'nullable|file|max:20480' // Max 20MB (Updated to 20MB to be safe)
            ]);

            $filePath = null;
            if ($request->hasFile('archivo')) {
                $file = $request->file('archivo');
                
                // Valid extensions check
                $validExtensions = ['sldprt', 'sldasm', 'slddrw', 'dxf', 'jpg', 'jpeg', 'png', 'pdf'];
                $extension = strtolower($file->getClientOriginalExtension());
                
                if (!in_array($extension, $validExtensions)) {
                    return response()->json([
                        'message' => 'El archivo debe ser formato SolidWorks, DXF, PDF o Imagen (.jpg, .png)',
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
            $adminEmail = 'elboomcel2@gmail.com'; 
            
            try {
                \Illuminate\Support\Facades\Mail::to($adminEmail)->send(new \App\Mail\FabricationQuoteRequest($quote));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Error sending quote email: ' . $e->getMessage());
                // Non-fatal error for the user, but we log it. We still return success if quote is saved.
                // Or if you prefer to fail hard:
                // throw $e; 
            }

            return response()->json([
                'message' => 'Cotización enviada exitosamente',
                'id' => $quote->id
            ], 201);

        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Fabrication Quote Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Ocurrió un error inesperado al procesar la solicitud: ' . $e->getMessage()
            ], 500);
        }
    }
}
