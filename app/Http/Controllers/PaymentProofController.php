<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Models\PaymentProof;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Product;
use App\Models\Order;
use Inertia\Inertia;
use PDF;

class PaymentProofController extends Controller
{
    
    public function uploadProof(Request $request, $orderId)
    {
        $request->validate([
            'payment_proof' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'notes' => 'nullable|string|max:500'
        ]);
        
        $user = Auth::user();
        $order = Order::where('id_order', $orderId)
            ->where('user_id', $user->id)
            ->first();
            
        if (!$order) {
            return back()->with('error', 'Orden no encontrada');
        }
        
        // Revisar si el estado del pedido es pending_payment
        if ($order->status !== 'pending_payment') {
            return back()->with('error', 'No se puede cargar comprobante para esta orden');
        }
        
        // Obtener el archivo del comprobante
        $file = $request->file('payment_proof');
        
        // Generar un nombre único para el archivo
        $fileName = 'payment_proof_' . $order->id_order . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
        
        // Guardar en ruta
        $path = $file->storeAs('payment_proofs', $fileName, 'public');
        
        $paymentProof = new PaymentProof([
            'order_id'   => $order->id_order,
            'file_path'  => $path,
            'file_name'  => $file->getClientOriginalName(),
            'file_type'  => $file->getMimeType(),
            'file_size'  => $file->getSize(),
            'notes'      => $request->input('notes'),
            'status'     => 'pending'
        ]);
        
        $paymentProof->save();
        
        $order->status = 'payment_uploaded';
        $order->save();
        
        return redirect()->route('orders.show', ['id' => $orderId])
            ->with('success', 'Comprobante cargado exitosamente. Tu pago está en revisión.');
    }

    public function adminListPending()
    {
        $pendingProofs = PaymentProof::with(['order', 'order.user'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return Inertia::render('Admin/PaymentProofs', [
            'pendingProofs' => $pendingProofs->map(function($proof) {
                return [
                    'id'             => $proof->id_payment_proof,
                    'order_id'       => $proof->order_id,
                    'customer_name'  => $proof->order->user->name,
                    'customer_email' => $proof->order->user->email,
                    'file_path'      => $proof->file_path,
                    'file_name'      => $proof->file_name,
                    'notes'          => $proof->notes,
                    'status'         => $proof->status,
                    'created_at'     => $proof->created_at->format('d/m/Y H:i'),
                    'total_amount'   => $proof->order->total_amount
                ];
            })
        ]);
    }

    public function adminApprove(Request $request, $proofId)
    {
        $proof = PaymentProof::findOrFail($proofId);
        $proof->status = 'approved';
        $proof->save();

        // Actualizar el estado de la orden
        $order = $proof->order;
        $order->status = 'payment_verified';
        $order->save();
        
        // Generar PDF si se solicitó
        if ($request->input('generatePdf', false)) {
            $pdfPath = $this->generateShippingOrderPdf($order);
            
            // Si se solicitó envío por correo
            if ($request->input('pdfAction') === 'email') {
                $this->sendShippingOrderEmail($order, $pdfPath);
                return redirect()->back()->with('success', 'Comprobante aprobado y PDF enviado por correo correctamente.');
            }

            // Si se solicitó descarga
            return redirect()->back()->with([
                'success' => 'Comprobante aprobado y PDF generado correctamente.',
                'pdfUrl'  => route('admin.orders.shipping-pdf', $order->id_order)
            ]);
        }

        return redirect()->back()->with('success', 'Comprobante aprobado exitosamente');
    }

    public function adminReject(Request $request, $proofId)
    {
        $request->validate([
            'admin_notes' => 'nullable|string|max:500'
        ]);

        $proof = PaymentProof::findOrFail($proofId);
        $proof->status = 'rejected';
        $proof->admin_notes = $request->input('admin_notes');
        $proof->save();

        // Obtener la orden asociada
        $order     = $proof->order;
        $oldStatus = $order->status;

        // Cambiar estado a rejected
        $order->status = 'rejected';
        $order->save();

        // Restaurar el stock
        if ($oldStatus !== 'cancelled' && $oldStatus !== 'rejected') {
            // \Log::info("Rechazando comprobante #{$proofId} para orden #{$order->id_order}. Restaurando stock...");

            foreach ($order->items as $item) {
                $product = Product::find($item->product_id);
                if ($product) {
                    // \Log::info("Producto #{$product->id_product}: Antes - Disponibilidad: {$product->disponibility}, Reservado: {$product->reserved_stock}");

                    $product->disponibility += $item->quantity;
                    if ($product->reserved_stock > 0) {
                        $product->reserved_stock -= min($item->quantity, $product->reserved_stock);
                    }
                    $product->save();

                    // \Log::info("Producto #{$product->id_product}: Después - Disponibilidad: {$product->disponibility}, Reservado: {$product->reserved_stock}");
                }
            }
        }

        return redirect()->back()->with('success', 'Comprobante rechazado. Se ha notificado al cliente y el stock ha sido restaurado.');
    }
    
    // Método para generar el PDF de orden de surtido
    public function generateShippingOrderPdf(Order $order)
    {
        
        $pdf = PDF::loadView('pdf.shipping_order', [
            'order'         => $order,
            'customer'      => $order->user,
            'items'         => $order->items,
            'address'       => $order->address,
            'dateGenerated' => now()->format('d/m/Y H:i')
        ]);
        
        $filename = 'orden_surtido_' . $order->id_order . '_' . time() . '.pdf';
        $path     = 'pdfs/shipping_orders/' . $filename;
        
        // Asegúrate de que el directorio exista
        Storage::disk('public')->makeDirectory('pdfs/shipping_orders', 0755, true, true);
        
        // Guardar el PDF en el almacenamiento
        Storage::disk('public')->put($path, $pdf->output());
        
        // Guardar referencia en la orden
        $order->shipping_order_pdf = $path;
        $order->save();
        
        return $path;
    }
    
    // Método para enviar el PDF por correo
    private function sendShippingOrderEmail(Order $order, $pdfPath)
    {
        // Obtener email del departamento de almacén desde la configuración
        $warehouseEmail = config('app.warehouse_email', 'almacen@ejemplo.com');
        
        Mail::send('emails.shipping_order', ['order' => $order], function ($message) use ($order, $pdfPath, $warehouseEmail) {
            $message->to($warehouseEmail)
                    ->subject('Nueva orden de surtido #' . $order->id_order)
                    ->attach(storage_path('app/public/' . $pdfPath));
        });
        
        // Registrar que se envió el correo
        $order->shipping_email_sent_at = now();
        $order->save();
    }
}
