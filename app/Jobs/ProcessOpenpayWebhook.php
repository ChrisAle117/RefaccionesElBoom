<?php

namespace App\Jobs;

use App\Http\Controllers\PaymentProofController;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use App\Services\DHLPickupService;
use Illuminate\Bus\Queueable;
use App\Models\ShoppingCart;
use UltraMsg\WhatsAppApi;
use App\Models\CartItem;
use App\Models\Payment;
use App\Models\Order;

class ProcessOpenpayWebhook implements ShouldQueue
{
    use Dispatchable, Queueable, InteractsWithQueue, SerializesModels;

    protected array $payload;

    public function __construct(array $payload)
    {
        $this->payload = $payload;
    }

    public function handle()
    {
        $eventType = $this->payload['type'] ?? 'unknown';
        $paymentMethod = 'unknown';
        
        // Determinar el método de pago basado en el tipo de evento
        if (strpos($eventType, 'charge') !== false) {
            $paymentMethod = 'tarjeta';
        } elseif (strpos($eventType, 'spei') !== false) {
            $paymentMethod = 'transferencia SPEI';
        } elseif (strpos($eventType, 'store') !== false) {
            $paymentMethod = 'pago en tienda';
        } elseif (strpos($eventType, 'transfer') !== false) {
            $paymentMethod = 'transferencia';
        }
        
        // Log::info("[Job] Processing Openpay webhook ({$paymentMethod}, evento: {$eventType}):", $this->payload);

        
        $event = $this->payload['type'] ?? null;

        
        if ($event === 'charge.created') {
            $orderId = data_get($this->payload, 'transaction.order_id');
            if (! $orderId) {
                // Log::error('Openpay webhook sin order_id en transaction.order_id.');
                return;
            }

            $order = Order::with('items.product')->find($orderId);
            if (! $order) {
                // Log::error("Pedido #{$orderId} no encontrado para verificar stock.");
                return;
            }

            foreach ($order->items as $item) {
                $product = $item->product;
                if (! $product) {
                    // Log::warning("Item {$item->id_order_item} sin producto asociado al verificar stock.");
                    continue;
                }
                $totalStock = $product->disponibility + $product->reserved_stock;
                if ($totalStock < $item->quantity) {
                    // Log::warning("Stock insuficiente para producto {$product->id_product}. Disponible: {$product->disponibility}, Reservado: {$product->reserved_stock}, Requerido: {$item->quantity}");
                } else {
                    // Log::info("✓ Stock verificado para producto {$product->id_product}: disponible {$product->disponibility}, reservado {$product->reserved_stock}");
                }
            }

            return;
        }

        
        if (in_array($event, [
            'charge.failed',
            'payment.payment_failed',
            'payment.canceled',
            'payment.cancelled',
            'spei.cancelled',           
            'store.cancelled',          
            'transfer.cancelled',       
        ], true)) {
            $orderId = data_get($this->payload, 'transaction.order_id');
            if ($order = Order::with('items.product')->find($orderId)) {
                $order->status = 'cancelled';
                $order->save();
                // Log::info("Pedido #{$orderId} marcado como cancelled.");

                foreach ($order->items as $item) {
                    $product = $item->product;
                    if (! $product) {
                        continue;
                    }
                    $beforeDisp = $product->disponibility;
                    $beforeRes  = $product->reserved_stock;
                    $toRelease  = min($beforeRes, $item->quantity);

                    $product->disponibility    = $beforeDisp + $toRelease;
                    $product->reserved_stock   = max(0, $beforeRes - $toRelease);
                    $beforeActive = $product->active;
                    $product->save();

                    // Log::info("Liberación de stock reservado para producto {$product->id_product}: disponible {$beforeDisp} → {$product->disponibility}, reservado {$beforeRes} → {$product->reserved_stock}, activo {$beforeActive} → {$product->active}");
                }

                $payment = Payment::where('order_id', $orderId)->first();
                if ($payment) {
                    $payment->status = 'cancelled';
                    $payment->save();
                    // Log::info("Pago para pedido #{$orderId} marcado como cancelled.");
                } else {
                    // Log::warning("No se encontró registro de pago para la orden cancelada #{$orderId}");
                }
            } else {
                // Log::error("No se encontró el pedido #{$orderId} para cancelarlo.");
            }

            return;
        }

        
        if (! in_array($event, [
            'charge.succeeded',
            'charge.succeededrecurrente',
            'payment.payment_verified',
            'payment.completed',
            'spei.received',            
            'spei.completed',           
            'store.payment_reported',   
            'store.completed',          
            'transfer.completed',       
            'transfers.completed',      
        ], true)) {
            // Log::info("Evento “{$event}” ignorado (no es un pago completado).");
            return;
        }

        
        $orderId = data_get($this->payload, 'transaction.order_id');
        
        
        if (!$orderId) {
            if (strpos($event, 'spei') !== false) {
                $orderId = data_get($this->payload, 'spei.order_id');
            } elseif (strpos($event, 'store') !== false) {
                $orderId = data_get($this->payload, 'store.order_id');
            } elseif (strpos($event, 'transfer') !== false) {
                $orderId = data_get($this->payload, 'transfer.order_id');
            }
        }
        
        // Extrae el ID real de la orden
        if ($orderId) {
            
            if (strpos($orderId, '-') !== false) {
                $orderId = substr($orderId, 0, strpos($orderId, '-'));
            }
        }
        
        if (! $orderId) {
            // Log::error('Openpay webhook sin order_id en la estructura del payload.', $this->payload);
            return;
        }
        $order = Order::with('items.product')->find($orderId);
        if (! $order) {
            // Log::error("Pedido #{$orderId} no encontrado.");
            return;
        }

        // Confirmar reserva y reducir stock
        foreach ($order->items as $item) {
            $product = $item->product;
            if (! $product) {
                // Log::warning("Item {$item->id_order_item} sin producto asociado.");
                continue;
            }
            $beforeDisp      = $product->disponibility;
            $beforeRes       = $product->reserved_stock;
            $reservedForThis = min($beforeRes, $item->quantity);

            if ($beforeDisp + $reservedForThis < $item->quantity) {
                // Log::warning("Stock insuficiente para producto {$product->id_product}.");
            }

            $product->reserved_stock  = max(0, $beforeRes - $reservedForThis);
            $remainingToDeduct        = max(0, $item->quantity - $reservedForThis);
            $product->disponibility   = max(0, $beforeDisp - $remainingToDeduct);
            $product->save();

            // Log::info("Producto {$product->id_product}: stock {$beforeDisp} → {$product->disponibility}, reservado {$beforeRes} → {$product->reserved_stock}");
        }

        // Marca pedido como pagado
        if ($order->status !== 'payment_verified') {
            $order->status       = 'payment_verified';
            $order->payment_date = now();
            $order->save();
            // Log::info("Pedido #{$order->id_order} marcado como payment_verified.");
        }

        $payment = Payment::where('order_id', $orderId)->first();
        if ($payment) {
            $payment->status = 'payment_verified';
            $payment->save();
            // Log::info("Pago para pedido #{$orderId} marcado como payment_verified.");
        } else {
            // Log::warning("No se encontró registro de pago para la orden #{$orderId}");
        }

        // Limpieza del carrito
        try {
            $userId = $order->user_id;
            if ($userId) {
                $cart = ShoppingCart::where('user_id', $userId)->first();
                if ($cart) {
                    $deleted = CartItem::where('shopping_cart_id', $cart->id_shopping_cart)->delete();
                    $cart->touch();
                    // Log::info("Carrito del usuario #{$userId} limpiado: {$deleted} items eliminados.");
                }
            }
        } catch (\Throwable $e) {
            // Log::error("Error al limpiar el carrito: " . $e->getMessage());
        }
        
        dispatch(new \App\Jobs\ProcessOrderPostPayment($orderId));
        // Log::info("Procesamiento posterior al pago enviado a cola para orden #{$orderId}");
    }
}
