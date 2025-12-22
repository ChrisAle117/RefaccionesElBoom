<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Address;
use GuzzleHttp\Client;
use App\Models\Order;
use Carbon\Carbon;
use Exception;


class OpenpayCheckoutController extends Controller
{
    /**
     * Formatea un valor monetario a exactamente 2 decimales evitando errores de punto flotante.
     * Devuelve string como "253.36".
     */
    private function money2($value): string
    {
        if (extension_loaded('bcmath')) {
            return bcadd((string)$value, '0', 2);
        }
        $num = (float) $value;
        $rounded = round($num, 2);
        return number_format($rounded, 2, '.', '');
    }

    /**
     * Devuelve los primeros 10 dígitos de un número telefónico, o null si no hay suficientes dígitos.
     */
    private function extractPhone10(?string $phone): ?string
    {
        $digits = preg_replace('/\D+/', '', (string) ($phone ?? '')) ?: '';
        if (strlen($digits) < 10) {
            return null;
        }
        return substr($digits, 0, 10);
    }

    /**
     * Obtiene teléfono de una dirección. Devuelve null si la dirección no existe o no tiene un teléfono válido.
     */
    private function getAddressPhone($addressId): ?string
    {
        if (!$addressId) {
            return null;
        }
        $address = \App\Models\Address::find($addressId);
        if (!$address) {
            return null;
        }
        return $this->extractPhone10($address->telefono ?? null);
    }

    public function createCheckout(Request $request)
    {
        // Forzar respuesta JSON
        $request->headers->set('Accept', 'application/json');

        // Evitar expansión de floats en json_encode
        @ini_set('serialize_precision', '-1');

        // Validación de datos (regla dinámica para address_id)
        $addressRule = $request->boolean('pickup_in_store')
            ? 'nullable|integer|exists:addresses,id_direccion'
            : 'required|integer|exists:addresses,id_direccion';

        $validator = Validator::make($request->all(), [
            'pickup_in_store' => 'sometimes|boolean',
            'address_id'      => $addressRule,
            'amount'          => 'required|numeric|min:0.01',
            'description'     => 'required|string',
            'return_url'      => 'required|string',
            'cancel_url'      => 'required|string',
            'product_id'      => 'sometimes|integer|exists:products,id_product',
            'quantity'        => 'sometimes|integer|min:1',
            'payment_method'  => 'sometimes|string|in:openpay_card,openpay_store,openpay_spei',
            'requires_invoice'       => 'sometimes|boolean',
            'rfc'                    => ['sometimes','required_if:requires_invoice,1','string','regex:/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i','max:13'],
            'tax_situation_document' => 'sometimes','required_if:requires_invoice,1','string','max:255', // ruta relativa en storage/app/public
            // Si es pickup en sucursal, permitimos/solicitamos un teléfono directamente
            'phone'                  => ['sometimes','required_if:pickup_in_store,1','string','min:10','max:20'],
        ]);

        if ($validator->fails()) {
            // Log::error('Validación fallida createCheckout', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'error'   => 'Datos inválidos',
                'details' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();

        $normalizedAmount       = $this->money2($validated['amount']);
        $validated['amount']    = $normalizedAmount;
        $requiresInvoice        = (bool) ($validated['requires_invoice'] ?? false);
        $pickupInStore          = (bool) ($validated['pickup_in_store'] ?? false);

        DB::beginTransaction();

        try {
            // Usuario
            $user = auth()->user();
            if (!$user) {
                throw new Exception('Usuario no autenticado');
            }

            // Log::info('Creando orden Openpay para usuario', ['user_id' => $user->id]);

            // Método de pago 
            $paymentMethod = $request->input('payment_method', 'openpay_card');
            if (!in_array($paymentMethod, ['openpay_card', 'openpay_store', 'openpay_spei'], true)) {
                $paymentMethod = 'openpay_card';
            }

            // Si es pickup y no viene address_id, crear/usar la dirección "Sucursal" para el usuario
            // Se exige un teléfono real: si no hay teléfono registrado, se rechaza la operación
            if ($pickupInStore && empty($validated['address_id'])) {
                // Intentar obtener un teléfono real del usuario o de alguna otra dirección del usuario
                // Priorizar teléfono enviado por el frontend
                $incomingPhone = $this->extractPhone10($request->input('phone'));
                $userPhonePrimary = $incomingPhone ?: $this->extractPhone10($user->phone ?? null);
                $userRealPhone = Address::where('user_id', $user->id)
                    ->where(function($q){
                        $q->whereNull('referencia')
                        ->orWhere('referencia','!=','Recoger en sucursal');
                    })
                    ->where('calle','!=','Sucural El Boom Alpuyeca')
                    ->orderByDesc('id_direccion')
                    ->value('telefono');
                $userPhoneFromAddress = $this->extractPhone10($userRealPhone ?: null);
                $phoneForPickup = $userPhonePrimary ?: $userPhoneFromAddress;

                if (!$phoneForPickup) {
                    throw new Exception('Para recoger en sucursal debes registrar un número de teléfono en tu perfil o en alguna dirección.');
                }

                // Reutiliza una dirección técnica existente si ya fue creada para el usuario
                $existing = Address::where('user_id', $user->id)
                    ->where('calle', 'Sucural El Boom Alpuyeca')
                    ->where('referencia', 'Recoger en sucursal')
                    ->first();

                if ($existing) {
                    // Actualiza teléfono si el existente no es válido (o es vacío) y hay uno real disponible
                    $existingDigits = $this->extractPhone10($existing->telefono ?? null);
                    if (!$existingDigits && $phoneForPickup) {
                        $existing->telefono = $phoneForPickup;
                        $existing->save();
                    }
                    $validated['address_id'] = $existing->id_direccion;
                } else {
                    $addr = new Address();
                    $addr->user_id         = $user->id;
                    // Dirección fija de sucursal
                    $addr->calle           = 'Sucural El Boom Alpuyeca';
                    $addr->colonia         = 'Centro';
                    $addr->numero_exterior = 'SN';
                    $addr->numero_interior = null;
                    // Código postal proporcionado
                    $addr->codigo_postal   = '62660';
                    $addr->estado          = 'Morelos';
                    $addr->ciudad          = 'Puente de Ixtla';
                    $addr->telefono        = $phoneForPickup; // Teléfono válido requerido para pickup
                    $addr->referencia      = 'Recoger en sucursal';
                    $addr->save();
                    $validated['address_id'] = $addr->id_direccion;
                }
            }

            // Crear orden
            $order                   = new Order();
            $order->user_id          = $user->id;
            $order->status           = 'pending_payment';
            $order->total_amount     = $normalizedAmount; // "xx.yy"
            // address_id puede venir nulo cuando es recoger en sucursal
            $order->address_id       = $validated['address_id'] ?? null;
            $order->payment_method   = $paymentMethod;
            $order->expires_at       = Carbon::now()->addDays(1);

            // Factura
            $order->requires_invoice = $requiresInvoice;
            if ($requiresInvoice) {
                $order->rfc                    = $validated['rfc'] ?? null;
                $order->tax_situation_document = $validated['tax_situation_document'] ?? null;
            }

            $order->save();

            // Guardar bandera de pickup en cache temporal para procesos posteriores al pago
            if ($pickupInStore) {
                try {
                    \Cache::put("order:pickup_in_store:{$order->id_order}", true, now()->addDays(2));
                } catch (\Throwable $e) {
                    // Log::warning('No se pudo almacenar pickup_in_store en cache: ' . $e->getMessage());
                }
            }

            // Log::info('Orden creada', [
            //     'order_id'         => $order->id_order,
            //     'requires_invoice' => $order->requires_invoice,
            //     'rfc'              => $order->rfc,
            //     'tax_doc'          => $order->tax_situation_document,
            // ]);

            // Detalles de la orden
            if ($request->filled('product_id') && $request->filled('quantity')) {
                // Lock product row to avoid concurrent reservations
                $product = Product::where('id_product', $validated['product_id'])->lockForUpdate()->first();
                if (!$product) {
                    throw new Exception('Producto no encontrado');
                }
                if ($product->disponibility < $validated['quantity']) {
                    throw new Exception("Inventario insuficiente para {$product->name}");
                }

                $orderItem             = new OrderItem();
                $orderItem->order_id   = $order->id_order;
                $orderItem->product_id = $product->id_product;
                $orderItem->quantity   = $validated['quantity'];
                $orderItem->price      = $product->price;
                $orderItem->save();

                $beforeDisp                   = $product->disponibility;
                $beforeRes                    = $product->reserved_stock;
                $product->disponibility       = max(0, $beforeDisp - $validated['quantity']);
                $product->reserved_stock      = $beforeRes + $validated['quantity'];
                $product->save();

                // Log::info("Reserva de stock (compra directa)", [
                //     'product_id' => $product->id_product,
                //     'from'       => ['disp' => $beforeDisp, 'res' => $beforeRes],
                //     'to'         => ['disp' => $product->disponibility, 'res' => $product->reserved_stock],
                // ]);
            } else {
                // Carrito
                try {
                    $cart = $user->cart()->with('products')->first();
                    if (!$cart || !$cart->products || $cart->products->isEmpty()) {
                        throw new Exception('Carrito vacío o no disponible');
                    }

                    foreach ($cart->products as $cartProduct) {
                        // Lock each product before modifying stock
                        $product = Product::where('id_product', $cartProduct->id_product)->lockForUpdate()->first();
                        if (!$product) continue;

                        $quantity = (int) $cartProduct->pivot->quantity;
                        if ($product->disponibility < $quantity) {
                            throw new Exception("Inventario insuficiente para {$product->name}");
                        }

                        $oi             = new OrderItem();
                        $oi->order_id   = $order->id_order;
                        $oi->product_id = $product->id_product;
                        $oi->quantity   = $quantity;
                        $oi->price      = $product->price;
                        $oi->save();

                        $beforeDisp              = $product->disponibility;
                        $beforeRes               = $product->reserved_stock;
                        $product->disponibility  = max(0, $beforeDisp - $quantity);
                        $product->reserved_stock = $beforeRes + $quantity;
                        $product->save();

                        // Log::info("Reserva de stock (carrito)", [
                        //     'product_id' => $product->id_product,
                        //     'from'       => ['disp' => $beforeDisp, 'res' => $beforeRes],
                        //     'to'         => ['disp' => $product->disponibility, 'res' => $product->reserved_stock],
                        // ]);
                    }

                    // Log::info('Detalles de orden creados desde carrito', ['order_id' => $order->id_order]);
                } catch (Exception $e) {
                    // Log::error('Error procesando carrito', ['msg' => $e->getMessage()]);
                    throw new Exception('Error al procesar el carrito: ' . $e->getMessage());
                }
            }

            // Configuración Openpay
            // Log::info('Iniciando configuración de Openpay');

            $merchantId = config('services.openpay.merchant_id');
            $privateKey = config('services.openpay.private_key');
            // Usar la clave correcta del archivo de configuración ("sandbox").
            $isSandbox  = (bool) config('services.openpay.sandbox', true);

            if (empty($merchantId) || empty($privateKey)) {
                throw new Exception('Configuración de Openpay incompleta');
            }

            // Log::info('Configuración de Openpay OK', [
            //     'merchant_id' => $merchantId,
            //     'is_sandbox'  => $isSandbox ? 'true' : 'false'
            // ]);

            $amountForGateway = $normalizedAmount; 

            // Obtener teléfono para el payload de Openpay
            if ($pickupInStore) {
                // Preferir teléfono del usuario; si no, el de la dirección asignada (Sucursal)
                // Priorizar el teléfono enviado por el frontend si viene
                $phoneForPayload = $this->extractPhone10($request->input('phone'));
                if (!$phoneForPayload) {
                    $phoneForPayload = $this->extractPhone10($user->phone ?? null);
                }
                if (!$phoneForPayload) {
                    $phoneForPayload = $this->getAddressPhone($validated['address_id'] ?? null);
                }
                if (!$phoneForPayload) {
                    throw new Exception('No se encontró un teléfono válido para el usuario. Por favor, agrega un teléfono antes de pagar.');
                }
            } else {
                // Envío a domicilio: usar teléfono de la dirección seleccionada, obligatorio
                $phoneForPayload = $this->getAddressPhone($validated['address_id'] ?? null);
                if (!$phoneForPayload) {
                    throw new Exception('La dirección seleccionada no tiene un teléfono válido. Actualiza la dirección para continuar.');
                }
            }

            $checkoutData = [
                'amount'       => $amountForGateway,
                'description'  => $validated['description'],
                'order_id'     => (string) $order->id_order . '-' . time(),
                'currency'     => 'MXN',
                'redirect_url' => $validated['return_url'] . '?order_id=' . $order->id_order,
                'cancel_url'   => $validated['cancel_url'] . '?order_id=' . $order->id_order,
                'customer'     => [
                    'name'         => $user->name ?? 'Cliente',
                    'email'        => $user->email ?? 'cliente@example.com',
                    'phone_number' => $phoneForPayload,
                ],
                'send_email'   => false,
            ];

            // Log::info('Payload hacia Openpay', [
            //     'amount_type' => gettype($checkoutData['amount']),
            //     'payload'     => $checkoutData,
            // ]);  

            // Llamada HTTP directa al endpoint de Checkouts
            $baseApiUrl = $isSandbox
                ? 'https://sandbox-api.openpay.mx/v1/'
                : 'https://api.openpay.mx/v1/';

            $apiUrl  = $baseApiUrl . $merchantId . '/checkouts';
            $client  = new Client();
            $resp    = $client->request('POST', $apiUrl, [
                'headers'     => [
                    'Authorization' => 'Basic ' . base64_encode($privateKey . ':'),
                    'Content-Type'  => 'application/json',
                ],
                'body'        => json_encode($checkoutData, JSON_UNESCAPED_SLASHES),
                'http_errors' => false,
                'timeout'     => 20,
                'connect_timeout' => 10,
            ]);

            $statusCode = $resp->getStatusCode();
            $bodyJson   = json_decode($resp->getBody());

            // Log::info('Respuesta de Openpay', [
            //     'status'   => $statusCode,
            //     'response' => $bodyJson,
            // ]);

            if ($statusCode < 200 || $statusCode >= 300) {
                throw new Exception('Error al crear checkout: ' .
                    ($bodyJson->error_code ?? '') . ' - ' .
                    ($bodyJson->description ?? 'Error desconocido'));
            }

            if (!isset($bodyJson->id) || !isset($bodyJson->checkout_link)) {
                throw new Exception('Respuesta de Openpay incompleta');
            }

            $checkoutId  = $bodyJson->id;
            $checkoutUrl = $bodyJson->checkout_link;

            // Guardar pago
            $payment                 = new Payment();
            $payment->order_id       = $order->id_order;
            $payment->amount         = $normalizedAmount; // "xx.yy"
            $payment->transaction_id = $checkoutId;
            $payment->payment_method = $order->payment_method;
            $payment->status         = 'pending';
            $payment->save();

            // Log::info("Registro de pago creado", [
            //     'order_id'   => $order->id_order,
            //     'payment_id' => $payment->id,
            //     'tx'         => $checkoutId,
            // ]);

            if ($user && $user->cart) {
                $user->cart->products()->detach();
                // Log::info("Carrito limpiado tras crear orden", ['user_id' => $user->id, 'order_id' => $order->id_order]);
            }

            DB::commit();

            return response()->json([
                'success'      => true,
                'checkout_url' => $checkoutUrl,
                'order_id'     => $order->id_order,
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            // Log::error('Error creando checkout', [
            //     'message' => $e->getMessage(),
            //     'file'    => $e->getFile(),
            //     'line'    => $e->getLine(),
            //     'trace'   => $e->getTraceAsString(),
            // ]);

            return response()->json([
                'success' => false,
                'error'   => $e->getMessage(),
            ], 422);
        }
    }

    public function handleSuccess(Request $request)
    {
        // Log::info('Pago exitoso recibido', ['query' => $request->all()]);

        try {
            $orderId = $request->query('order_id');
            if (!$orderId) {
                throw new Exception('ID de orden no proporcionado');
            }

            $order = Order::find($orderId);
            if (!$order) {
                throw new Exception('Orden no encontrada');
            }

            $order->status       = 'payment_verified';
            $order->payment_date = Carbon::now();
            $order->save();

            $payment = Payment::where('order_id', $orderId)->first();
            if ($payment) {
                $payment->status = 'payment_verified';
                $payment->save();
                // Log::info("Pago verificado", ['order_id' => $orderId]);
            } else {
                // Log::warning("Pago no encontrado para la orden", ['order_id' => $orderId]);
            }

        $orderItems = OrderItem::where('order_id', $order->id_order)->get();
        DB::beginTransaction();
            try {
                foreach ($orderItems as $item) {
            // Lock product to adjust reserved/available safely
            $product = Product::where('id_product', $item->product_id)->lockForUpdate()->first();
                    if ($product) {
                        $beforeDisp = $product->disponibility;
                        $beforeRes  = $product->reserved_stock;

                        $reservedForThis            = min($beforeRes, $item->quantity);
                        $product->reserved_stock    = max(0, $beforeRes - $reservedForThis);
                        $remainingToDeduct          = max(0, $item->quantity - $reservedForThis);
                        $product->disponibility     = max(0, $beforeDisp - $remainingToDeduct);
                        $product->save();

                        // Log::info("Stock tras éxito de pago", [
                        //     'product_id' => $product->id_product,
                        //     'from'       => ['disp' => $beforeDisp, 'res' => $beforeRes],
                        //     'to'         => ['disp' => $product->disponibility, 'res' => $product->reserved_stock],
                        // ]);
                    }
                }
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                // Log::error("Error actualizando stock después del pago: " . $e->getMessage());
                throw $e;
            }

            // Si moviste la limpieza del carrito aquí, este es el lugar:
            // if ($order->user_id) {
            //     $user = \App\Models\User::find($order->user_id);
            //     if ($user && $user->cart) {
            //         $user->cart->products()->detach();
            //     }
            // }

            // Prepara datos para conversión de Google Ads en el siguiente render
            $conversionData = [
                'transaction_id' => (string) $order->id_order,
                'value'          => (float) $order->total_amount,
                'currency'       => config('services.google_ads.currency', 'MXN'),
            ];

            return redirect()->route('dashboard')
                ->with('success', 'Tu orden #' . $order->id_order . ' ha sido procesada correctamente')
                ->with('ads_conversion', $conversionData);
        } catch (Exception $e) {
            // Log::error('Error procesando éxito de pago: ' . $e->getMessage());
            return redirect()->route('payment.error.page')
                ->with('error', 'Error procesando el pago: ' . $e->getMessage());
        }
    }

    public function handleCancellation(Request $request)
    {
        // Log::info('Pago cancelado recibido', ['query' => $request->all()]);

        try {
            $orderId = $request->query('order_id');
            if (!$orderId) {
                throw new Exception('ID de orden no proporcionado');
            }

            $order = Order::find($orderId);
            if (!$order) {
                throw new Exception('Orden no encontrada');
            }

            $order->status = 'cancelled';
            $order->save();

            // Liberar reservados
            $orderItems = OrderItem::where('order_id', $order->id_order)->get();
            DB::beginTransaction();
            try {
                foreach ($orderItems as $item) {
                    $product = Product::find($item->product_id);
                    if ($product) {
                        $beforeDisp = $product->disponibility;
                        $beforeRes  = $product->reserved_stock;

                        $toRelease                = min($product->reserved_stock, $item->quantity);
                        $product->disponibility   = $beforeDisp + $toRelease;
                        $product->reserved_stock  = max(0, $beforeRes - $toRelease);
                        $product->save();

                        // Log::info("Liberación de stock por cancelación", [
                        //     'product_id' => $product->id_product,
                        //     'from'       => ['disp' => $beforeDisp, 'res' => $beforeRes],
                        //     'to'         => ['disp' => $product->disponibility, 'res' => $product->reserved_stock],
                        // ]);
                    }
                }
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                // Log::error("Error liberando stock reservado en cancelación: " . $e->getMessage());
            }

            $payment = Payment::where('order_id', $orderId)->first();
            if ($payment) {
                $payment->status = 'cancelled';
                $payment->save();
                // Log::info("Pago marcado como cancelled", ['order_id' => $orderId]);
            }

            return redirect()->route('payment.cancelled.page', ['order_id' => $order->id_order])
                ->with('message', 'Pago cancelado por el usuario');
        } catch (Exception $e) {
            // Log::error('Error procesando cancelación de pago: ' . $e->getMessage());
            return redirect()->route('payment.error.page')
                ->with('error', 'Error procesando la cancelación: ' . $e->getMessage());
        }
    }

    // Páginas de respuesta 
    public function showSuccessPage(Request $request)
    {
        // Log::info('Mostrando página de éxito', ['query' => $request->all()]);

        $orderId = $request->query('order_id');
        $message = 'Pago procesado correctamente';

        if ($orderId) {
            $order = Order::find($orderId);
            if ($order) {
                $message = 'Tu orden #' . $order->id_order . ' ha sido procesada correctamente';
                $payment = Payment::where('order_id', $orderId)->first();
                if ($payment && (str_contains($payment->payment_method, 'spei') || str_contains($payment->payment_method, 'store'))) {
                    $message = 'Tu orden #' . $order->id_order . ' ha sido registrada y está pendiente de confirmación de pago';
                }
            }
        }

        return redirect()->route('dashboard')->with('success', $message);
    }

    private function getProcessingMessage($paymentMethod)
    {
        if (str_contains($paymentMethod, 'spei')) {
            return "Tu pago por transferencia SPEI está siendo procesado. En algunos casos, la confirmación bancaria puede demorar hasta 30 minutos. Te enviaremos un correo cuando se confirme.";
        } elseif (str_contains($paymentMethod, 'store')) {
            return "Tu pago en tienda está siendo procesado. Una vez confirmado, recibirás un correo electrónico con los detalles de tu envío.";
        } else {
            return "Tu pago con tarjeta está siendo procesado. Esto suele tomar unos momentos.";
        }
    }

    public function showCancelledPage(Request $request)
    {
        // Log::info('Mostrando página de cancelación', ['query' => $request->all()]);

        $orderId = $request->query('order_id');
        $order = null;

        if ($orderId) {
            $order = Order::find($orderId);
            // Solo marcar como cancelada si realmente está pendiente de pago
            if ($order && $order->status === 'pending_payment') {
                $order->status = 'cancelled';
                $order->save();
                // Log::info("Pedido marcado como cancelled al mostrar página", ['order_id' => $orderId]);

                $orderItems = \App\Models\OrderItem::where('order_id', $order->id_order)->get();
                DB::beginTransaction();
                try {
                    foreach ($orderItems as $item) {
                        $product = \App\Models\Product::find($item->product_id);
                        if ($product) {
                            $beforeDisp = $product->disponibility;
                            $beforeRes  = $product->reserved_stock;

                            $toRelease               = min($product->reserved_stock, $item->quantity);
                            $product->disponibility  = $beforeDisp + $toRelease;
                            $product->reserved_stock = max(0, $beforeRes - $toRelease);
                            $product->save();

                            // Log::info("Liberación de stock (vista cancelación)", [
                            //     'product_id' => $product->id_product,
                            //     'from'       => ['disp' => $beforeDisp, 'res' => $beforeRes],
                            //     'to'         => ['disp' => $product->disponibility, 'res' => $product->reserved_stock],
                            // ]);
                        }
                    }
                    DB::commit();
                } catch (\Exception $e) {
                    DB::rollBack();
                    // Log::error("Error liberando stock reservado en cancelación (vista): " . $e->getMessage());
                }

                $payment = \App\Models\Payment::where('order_id', $orderId)->first();
                if ($payment) {
                    $payment->status = 'cancelled';
                    $payment->save();
                    // Log::info("Pago marcado como cancelled (vista)", ['order_id' => $orderId]);
                }
            }
        }

        return view('payment.cancelled', ['order' => $order]);
    }

    public function showErrorPage(Request $request)
    {
        // Log::info('Mostrando página de error', ['query' => $request->all()]);

        $errorMessage = session('error', 'Ha ocurrido un error durante el proceso de pago.');

        return view('payment.error', ['errorMessage' => $errorMessage]);
    }

    /**
     * Función administrativa para sincronizar estados de pagos con sus órdenes correspondientes
     * Esta función es solo para uso administrativo
     */
    public function syncPaymentStatuses(Request $request)
    {
        if (!auth()->check() || !auth()->user()->isAdmin()) {
            abort(403, 'No autorizado');
        }

        $count = 0;

        $ordersVerified = Order::whereIn('status', ['payment_verified', 'processing', 'shipped', 'delivered'])->get();
        foreach ($ordersVerified as $order) {
            $payment = Payment::where('order_id', $order->id_order)->first();
            if ($payment && $payment->status !== 'payment_verified') {
                $payment->status = 'payment_verified';
                $payment->save();
                $count++;
                // Log::info("Sincronización: Pago para orden #{$order->id_order} actualizado a payment_verified");
            }
        }

        $ordersCancelled = Order::where('status', 'cancelled')->get();
        foreach ($ordersCancelled as $order) {
            $payment = Payment::where('order_id', $order->id_order)->first();
            if ($payment && $payment->status !== 'cancelled') {
                $payment->status = 'cancelled';
                $payment->save();
                $count++;
                // Log::info("Sincronización: Pago para orden cancelada #{$order->id_order} actualizado a cancelled");
            }
        }

        if ($count > 0) {
            return back()->with('success', "Se sincronizaron {$count} registros de pago.");
        } else {
            return back()->with('info', "No se encontraron pagos que necesiten sincronización.");
        }
    }
}
