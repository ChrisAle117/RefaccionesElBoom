<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class InvoiceController extends Controller
{
    public function uploadConstancia(Request $request)
    {
        $request->validate([
            'constancia' => ['required','file','mimes:pdf','max:5120'], 
        ]);

        $file = $request->file('constancia');
        $path = $file->store('invoices/constancias/'.now()->format('Y/m'), 'public'); 

        return response()->json([
            'success' => true,
            'data' => [
                'path' => $path,
                'name' => $file->getClientOriginalName(),
                'public_url' => Storage::disk('public')->url($path),
            ],
        ]);
    }
}
