<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Order;

class PaymentCancelController extends Controller
{
    /**
     * Maneja la cancelación de un pago cuando el usuario hace clic en atrás en el navegador
     */
    public function handleNavigationCancel(Request $request)
    {
        // Log::info('Cancelación por navegación detectada', ['query' => $request->all()]);

        try {
            $orderId = $request->query('order_id');
            if (!$orderId) {
                throw new \Exception('ID de orden no proporcionado');
            }

            $order = Order::find($orderId);
            if (!$order) {
                throw new \Exception('Orden no encontrada');
            }

            // Solo cancelar si la orden está pendiente
            if ($order->status === 'pending_payment') {
                $order->status = 'cancelled';
                $order->save();
                // Log::info("Pedido cancelado por navegación", ['order_id' => $orderId]);

                // Liberar stock reservado
                $orderItems = OrderItem::where('order_id', $order->id_order)->get();
                DB::beginTransaction();
                try {
                    foreach ($orderItems as $item) {
                        $product = Product::find($item->product_id);
                        if ($product) {
                            $beforeDisp = $product->disponibility;
                            $beforeRes = $product->reserved_stock;
                            $toRelease = min($product->reserved_stock, $item->quantity);
                            $product->disponibility = $beforeDisp + $toRelease;
                            $product->reserved_stock = max(0, $beforeRes - $toRelease);
                            $product->save();

                            // Log::info("Liberación de stock por cancelación de navegación", [
                            //     'product_id' => $product->id_product,
                            //     'from' => ['disp' => $beforeDisp, 'res' => $beforeRes],
                            //     'to' => ['disp' => $product->disponibility, 'res' => $product->reserved_stock],
                            // ]);
                        }
                    }
                    DB::commit();
                } catch (\Exception $e) {
                    DB::rollBack();
                    // Log::error("Error liberando stock reservado en cancelación por navegación: " . $e->getMessage());
                }

                // Actualizar registro de pago
                $payment = Payment::where('order_id', $orderId)->first();
                if ($payment) {
                    $payment->status = 'cancelled';
                    $payment->save();
                    // Log::info("Pago marcado como cancelado por navegación", ['order_id' => $orderId]);
                }
            }

            return response('OK', 200);
        } catch (\Exception $e) {
            // Log::error('Error procesando cancelación por navegación: ' . $e->getMessage());
            return response('Error', 500);
        }
    }
}
