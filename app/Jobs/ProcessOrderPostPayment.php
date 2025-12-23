<?php

namespace App\Jobs;

use App\Http\Controllers\PaymentProofController;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use App\Services\DHLPickupService;
use App\Jobs\SendWarehouseEmail;
use Illuminate\Bus\Queueable;
use UltraMsg\WhatsAppApi;
use App\Models\Order;
use App\Models\DhlPickup;

class ProcessOrderPostPayment implements ShouldQueue
{
    use Dispatchable, Queueable, InteractsWithQueue, SerializesModels;

    protected $orderId;

    /**
     * Create a new job instance.
     *
     * @param int $orderId
     * @return void
     */
    public function __construct($orderId)
    {
        $this->orderId = $orderId;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        // Log::info("[Job] Procesando tareas post-pago para orden #{$this->orderId}");

        $order = Order::with(['user','address','items.product'])->find($this->orderId);
        if (!$order) {
            // Log::error("No se encontró la orden #{$this->orderId} para procesar tareas post-pago");
            return;
        }

        // Verificar si el pedido es para recoger en sucursal
        $isPickupInStore = false;
        try {
            // Intentamos primero por cache (más rápido)
            $isPickupInStore = \Cache::get("order:pickup_in_store:{$order->id_order}", false);
            
            // Si no está en cache o es falso, verificamos la dirección del pedido directamente
            if (!$isPickupInStore && $order->address) {
                $isPickupInStore = (
                    ($order->address->referencia && $order->address->referencia === 'Recoger en sucursal') ||
                    ($order->address->calle && str_starts_with($order->address->calle, 'REFACCIONES EL BOOM')) ||
                    ($order->address->calle && str_starts_with($order->address->calle, 'Refaccionaria EL BOOM'))
                );
            }
        } catch (\Throwable $e) {
            $isPickupInStore = false;
        }

        //Generar etiqueta DHL si falta y NO es recogida en sucursal
        if (!$isPickupInStore && $order->dhl_tracking_number === null) {
            $svc = app(\App\Services\DhlShipmentService::class);
            try {
                $res = $svc->createShipment($order);

                // Guardar ruta PDF, tracking y timestamp
                $order->dhl_label_path         = $res['label'];
                $order->dhl_tracking_number    = $res['tracking'];
                $order->dhl_label_created_at   = now();
                $order->save();

                // Log::info("Etiqueta DHL generada: {$res['tracking']} → {$res['label']}");
            } catch (\Throwable $e) {
                // Log::error("Error al generar etiqueta DHL: " . $e->getMessage());
            }

            //Programar pickup para este pedido si aplica
            if (!$isPickupInStore) {
                try {
                    /** @var DHLPickupService $pickupSvc */
                    $pickupSvc    = app(DHLPickupService::class);
                    $pickupResp   = $pickupSvc->schedulePickupForOrder($order);

                    // Guardar timestamp de programación
                    $order->dhl_pickup_scheduled_at = now();
                    $order->save();

                    // Persistir registro de recolección para vista de admin
                    try {
                        $dispatchNum = data_get($pickupResp, 'dispatchConfirmationNumber');
                        // Extraer información de origen desde config para coherencia con solicitud
                        $origin = config('services.dhl.origin');

                        // Tratar de inferir fecha y hora de la respuesta si viene, si no, dejar null
                        $plannedIso = data_get($pickupResp, 'plannedPickupDateAndTime') ?? data_get($pickupResp, 'plannedPickupDate');
                        // plannedPickupDateAndTime representa el inicio de ventana; DHL suele mandar "YYYY-mm-ddTHH:MM:SSGMT+/-HH:MM"
                        // Carbon no parsea "GMT+" directo, retiramos "GMT" para mantener el offset.
                        $plannedAt  = $plannedIso ? \Illuminate\Support\Carbon::parse(str_replace('GMT', '', $plannedIso)) : null;
                        $closeTime  = data_get($pickupResp, 'closeTime');

                        // Si la respuesta no trae horarios, calcularlos con la misma lógica usada por el servicio
                        if (!$plannedAt || !$closeTime) {
                            $tz        = 'America/Mexico_City';
                            $pickupCfg = config('services.dhl.pickup.pickup_time', '17:00');
                            $now       = \Illuminate\Support\Carbon::now($tz);
                            $cutoff    = \Illuminate\Support\Carbon::today($tz)->setTime(15, 0);
                            $pickupDt  = $now->greaterThan($cutoff) ? $now->copy()->addDay() : $now->copy();
                            $pickupDt->setTimeFromTimeString($pickupCfg);
                            $windowStartDt = $pickupDt->copy()->subMinutes(180);
                            $plannedAt = $plannedAt ?: $windowStartDt; // persistimos inicio de ventana
                            $closeTime = $closeTime ?: $pickupDt->format('H:i');
                        }
                        $location   = data_get($pickupResp, 'location') ?? 'recepción';
                        $locationTy = data_get($pickupResp, 'locationType') ?? 'residence';

                        DhlPickup::create([
                            'order_id'                      => $order->id_order,
                            'dispatch_confirmation_number'  => $dispatchNum,
                            'planned_pickup_at'             => $plannedAt,
                            'planned_pickup_tz'             => 'America/Mexico_City',
                            'close_time'                    => $closeTime,
                            'location'                      => $location,
                            'location_type'                 => $locationTy,
                            'origin_postal_code'            => data_get($origin, 'postal_code'),
                            'origin_city_name'              => data_get($origin, 'city_name'),
                            'origin_province_code'          => data_get($origin, 'province_code'),
                            'origin_country_code'           => data_get($origin, 'country_code'),
                            'origin_address_line1'          => data_get($origin, 'address_line1'),
                            'payload'                       => null, 
                            'response'                      => $pickupResp,
                        ]);
                    } catch (\Throwable $e) {
                        // No romper el flujo si falla el log; ya quedó programado en DHL
                        \Log::warning('No se pudo registrar DhlPickup: ' . $e->getMessage());
                    }

                    // Log::info("Pickup programado para pedido #{$order->id_order}: {$pickupResp['dispatchConfirmationNumber']}");
                } catch (\Throwable $e) {
                    Log::error("Error al programar pickup DHL: " . $e->getMessage());
                }
            }
        }

        //Generar PDF de surtido si aún falta
        if (empty($order->shipping_order_pdf)) {
            try {
                $pdfPath = app(PaymentProofController::class)
                    ->generateShippingOrderPdf($order);
                // Log::info("Orden de surtido generada: {$pdfPath}");
            } catch (\Throwable $e) {
                // Log::error("Error al generar orden de surtido: " . $e->getMessage());
            }
        }

        try {
            if (empty($order->shipping_email_sent_at)) {
                $trackingUrl = $order->dhl_tracking_number
                    ? "https://www.dhl.com/mx-es/home/rastreo.html?tracking-id={$order->dhl_tracking_number}"
                    : null;
            
                dispatch(new SendWarehouseEmail(
                    orderId:                 $order->id_order,
                    trackingNumber:          $order->dhl_tracking_number,
                    trackingUrl:             $trackingUrl,
                    labelPublicPath:         $order->dhl_label_path,     
                    shippingOrderPublicPath: $order->shipping_order_pdf   
                ));
            
                // \Log::info("Correo a Almacén encolado para orden #{$order->id_order}");
            } else {
                // \Log::info("Correo a Almacén ya enviado previamente (#{$order->id_order}), se omite.");
            }
        } catch (\Throwable $e) {
            // \Log::error("Error al encolar correo a Almacén: " . $e->getMessage());
        }

        //Envío automático por WhatsApp
        try {
            $cfg      = config('services.ultramsg');
            $waClient = new WhatsAppApi($cfg['token'], $cfg['instance_id']);
            $to       = $cfg['to']; 

            $labelUrl   = $order->dhl_label_path ? url("storage/{$order->dhl_label_path}") : null;
            $surtidoUrl = $order->shipping_order_pdf ? url("storage/{$order->shipping_order_pdf}") : null;

            // Enviar etiqueta DHL solo si existe
            if ($labelUrl) {
                $waClient->sendDocumentMessage(
                    $to,
                    basename($order->dhl_label_path),
                    $labelUrl,
                    "Etiqueta DHL de tu pedido #{$order->id_order}"
                );
            }

            // Enviar orden de surtido
            if ($surtidoUrl) {
                $waClient->sendDocumentMessage(
                    $to,
                    basename($order->shipping_order_pdf),
                    $surtidoUrl,
                    "Orden de surtido de tu pedido #{$order->id_order}"
                );
            }

            // Log::info(" WhatsApp enviado OK a {$to} para orden #{$order->id_order}");
        } catch (\Throwable $e) {
            // Log::error(" Error al enviar WhatsApp para orden #{$order->id_order}: {$e->getMessage()}");
        }
        
        // Log::info("[Job] Procesamiento post-pago completado para orden #{$this->orderId}");
    }
}
