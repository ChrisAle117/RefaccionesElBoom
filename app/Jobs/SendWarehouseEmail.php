<?php

namespace App\Jobs;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\View;
use App\Services\Mail\PhpMailService;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class SendWarehouseEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public int $orderId,
        public ?string $trackingNumber = null,
        public ?string $trackingUrl = null,
        public ?string $labelPublicPath = null,        
        public ?string $shippingOrderPublicPath = null 
    ) {}

    public function handle(PhpMailService $mailer): void
    {
        $order = Order::with(['user','address','items.product'])->find($this->orderId);
        if (!$order) {
            // Log::error("[SendWarehouseEmail] Orden {$this->orderId} no encontrada.");
            return;
        }

        // Idempotencia
        if (!empty($order->shipping_email_sent_at)) {
            // Log::info("[SendWarehouseEmail] Correo ya enviado (#{$order->id_order}), se omite.");
            return;
        }

        // Cuerpo del correo: usamos una vista específica para el email
        $html = View::make('emails.warehouse_notification', [
            'order'          => $order,
            'items'          => $order->items,
            'address'        => $order->address,
            'customer'       => $order->user,
            'dateGenerated'  => now()->format('d/m/Y H:i:s'),
            'trackingNumber' => $this->trackingNumber ?? $order->dhl_tracking_number,
            'trackingUrl'    => $this->trackingUrl,
        ])->render();

        // Adjuntos
        $attachments = [];

        // Etiqueta DHL
        $labelRel = $this->labelPublicPath ?? $order->dhl_label_path;
        if ($labelRel) {
            $labelAbs = storage_path('app/public/'.$labelRel);
            if (file_exists($labelAbs)) {
                $attachments[] = $labelAbs;
            } else {
                // Log::warning("[SendWarehouseEmail] No se encontró etiqueta: ".$labelAbs);
            }
        }

        // Orden de surtido (PDF)
        $shipRel = $this->shippingOrderPublicPath ?? $order->shipping_order_pdf;
        if ($shipRel) {
            $shipAbs = storage_path('app/public/'.$shipRel);
            if (file_exists($shipAbs)) {
                $attachments[] = $shipAbs;
            } else {
                // Log::warning("[SendWarehouseEmail] No se encontró orden de surtido: ".$shipAbs);
            }
        }

        //Constancia (PDF) si el cliente requirió factura 
        if ($order->requires_invoice && $order->tax_situation_document) {
            $constAbs = storage_path('app/public/'.$order->tax_situation_document);
            if (file_exists($constAbs)) {
                $attachments[] = $constAbs;
                // Log::info("[SendWarehouseEmail] Constancia adjuntada para la orden #{$order->id_order} ({$order->tax_situation_document}).");
            } else {
                // Log::warning("[SendWarehouseEmail] No se encontró constancia: ".$constAbs);
            }
        } else {
            // Log::info("[SendWarehouseEmail] La orden #{$order->id_order} no requiere factura o no tiene constancia.");
        }

        // Enviar
        $ok = $mailer->send(
            toEmail: 'almacen.alpuyeca@refaccioneselboom.com',
            toName:  'Orden de surtido',
            subject: "Orden #{$order->id_order} — Etiqueta DHL y orden de surtido",
            htmlBody: $html,
            attachments: $attachments,
            cc: ['ecommerce@refaccioneselboom.com' => 'Ecommerce']
        );

        if ($ok) {
            $order->shipping_email_sent_at = now();
            $order->save();
            // Log::info("[SendWarehouseEmail] Correo enviado (#{$order->id_order}).");
        } else {
            // Log::error("[SendWarehouseEmail] Falló el envío; se reintentará.");
            $this->release(60);
        }
    }
}
