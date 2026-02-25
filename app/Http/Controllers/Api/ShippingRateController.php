<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Services\DhlRateService;
use App\Models\Address;
use App\Models\Product;

class ShippingRateController extends Controller
{
    /**
     * GET /api/dhl/rate
     *
     * Query parameters:
     *  - address_id  (integer, required) ID de la tabla addresses (id_direccion)
     *  - product_id  (integer, required) ID de la tabla products (id_product)
     *  - quantity    (integer, optional) Unidades (default = 1)
     *
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function rate(Request $request)
    {
       
        $validator = Validator::make($request->all(), [
            'address_id' => 'required|integer|exists:addresses,id_direccion',
            'product_id' => 'required|integer|exists:products,id_product',
            'quantity'   => 'sometimes|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

      
        $address  = Address::findOrFail($request->input('address_id'));
        $product  = Product::findOrFail($request->input('product_id'));
        $quantity = $request->input('quantity', 1);
        
      
        $cartTotal = $product->price * $quantity;
        $freeShipping = $cartTotal >= 1000;

        try {
            
            /** @var array $result */
            $result = app(DhlRateService::class)->quote($address, $product, $quantity);

            
            $item = $result['products'][0] ?? $result['productsAndServices'][0] ?? null;
            if (! $item) {
                throw new \Exception('No se obtuvo ningún resultado de DHL');
            }

            
            $priceEntry = collect($item['totalPrice'] ?? $item['totalPriceBreakdown'] ?? [])
                ->first(fn($p) => ($p['priceCurrency'] ?? $p['currency']) === 'MXN');

            $price    = $priceEntry['price'] ?? $priceEntry['priceBreakdown'][0]['price'] ?? null;
            $currency = $priceEntry['priceCurrency'] ?? $priceEntry['currency'] ?? 'MXN';
            
          
            if ($freeShipping) {
                $originalPrice = $price;
                $price = 0;
            }

            
            $eta = $item['deliveryCapabilities']['estimatedDeliveryDateAndTime']
                ?? $item['deliveryCapabilities']['estimatedDeliveryDate']
                ?? null;

            return response()->json([
                'success' => true,
                'data'    => [
                    'price'    => $price,
                    'currency' => $currency,
                    'eta'      => $eta,
                    'free_shipping' => $freeShipping,
                    'original_price' => isset($originalPrice) ? $originalPrice : $price,
                ],
            ], 200);
        } catch (\Exception $e) {
            $parsed = $this->parseDhlError($e->getMessage());
            return response()->json([
                'success'      => false,
                'error_type'   => $parsed['type'],
                'user_message' => $parsed['message'],
                'message'      => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * POST /api/dhl/rate-cart
     *
     * Body JSON:
     *  - address_id: integer, required
     *  - items: array of { id_product: int, quantity: int }
     */
    public function rateCart(Request $request)
    {
        
        $validator = Validator::make($request->all(), [
            'address_id' => 'required|integer|exists:addresses,id_direccion',
            'items'      => 'required|array|min:1',
            'items.*.id_product' => 'required|integer|exists:products,id_product',
            'items.*.quantity'   => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        
        $address = Address::findOrFail($request->input('address_id'));
        $items   = $request->input('items');

        try {
            
            $cartTotal = 0;
            foreach ($items as $item) {
                $product = Product::findOrFail($item['id_product']);
                $cartTotal += $product->price * $item['quantity'];
            }


            $freeShipping = $cartTotal >= 1999;
            
            
            $result = app(DhlRateService::class)->quoteCart($address, $items);

            
            $item = $result['products'][0] 
                ?? $result['productsAndServices'][0] 
                ?? null;

            if (! $item) {
                throw new \Exception('No se obtuvo ningún resultado de DHL');
            }

                
            $priceEntry = collect($item['totalPrice'] ?? $item['totalPriceBreakdown'] ?? [])
                ->first(fn($p) => ($p['priceCurrency'] ?? $p['currency']) === 'MXN');

            $price    = $priceEntry['price'] 
                    ?? $priceEntry['priceBreakdown'][0]['price'] 
                    ?? null;
            $currency = $priceEntry['priceCurrency'] 
                    ?? $priceEntry['currency'] 
                    ?? 'MXN';

           
            $eta = $item['deliveryCapabilities']['estimatedDeliveryDateAndTime']
                ?? $item['deliveryCapabilities']['estimatedDeliveryDate']
                ?? null;
                
           
            if ($freeShipping) {
                $originalPrice = $price;
                $price = 0;
            }

            return response()->json([
                'success' => true,
                'data'    => [
                    'shipping_cost' => $price,
                    'currency'      => $currency,
                    'eta'           => $eta,
                    'free_shipping' => $freeShipping ?? false,
                    'original_price' => isset($originalPrice) ? $originalPrice : $price,
                ],
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Error al cotizar carrito: ' . $e->getMessage());
            $parsed = $this->parseDhlError($e->getMessage());

            $status = (str_contains($e->getMessage(), '[400]')) ? 400 : 500;

            return response()->json([
                'success'      => false,
                'error_type'   => $parsed['type'],
                'user_message' => $parsed['message'],
                'message'      => $e->getMessage(),
            ], $status);
        }
    }

    
    private function parseDhlError(string $rawMessage): array
    {
        $msg = strtolower($rawMessage);

        
        if (
            str_contains($msg, 'weekend') ||
            str_contains($msg, 'holiday') ||
            str_contains($msg, 'not a business day') ||
            str_contains($msg, 'no es día hábil') ||
            str_contains($msg, 'pickup not available') ||
            preg_match('/plannedshipping.*saturday|plannedshipping.*sunday/i', $rawMessage)
        ) {
            return [
                'type'    => 'weekend_holiday',
                'message' => 'DHL no realiza recolecciones en fines de semana ni días festivos. Tu pedido será programado para el siguiente día hábil.',
            ];
        }

        
        if (
            str_contains($msg, 'postal') ||
            str_contains($msg, 'zip') ||
            str_contains($msg, 'no service') ||
            str_contains($msg, 'not serviceable') ||
            str_contains($msg, 'serviceability') ||
            str_contains($msg, 'cannot be delivered') ||
            str_contains($msg, 'invalid destination')
        ) {
            return [
                'type'    => 'unserviceable_area',
                'message' => 'Lo sentimos, DHL no tiene cobertura en el código postal de tu dirección. Puedes recoger tu pedido en nuestra sucursal.',
            ];
        }

        
        if (
            str_contains($msg, '401') ||
            str_contains($msg, 'unauthorized') ||
            str_contains($msg, 'authentication') ||
            str_contains($msg, 'credentials')
        ) {
            return [
                'type'    => 'auth_error',
                'message' => 'Error de configuración con DHL. Por favor contacta a soporte.',
            ];
        }

        
        if (
            str_contains($msg, 'weight') ||
            str_contains($msg, 'dimension') ||
            str_contains($msg, 'exceeds') ||
            str_contains($msg, 'maximum')
        ) {
            return [
                'type'    => 'dimensions_error',
                'message' => 'Uno o más productos del pedido exceden los límites de peso o dimensiones de DHL. Contacta a soporte.',
            ];
        }

        
        if (
            str_contains($msg, 'timeout') ||
            str_contains($msg, 'timed out') ||
            str_contains($msg, 'connection')
        ) {
            return [
                'type'    => 'timeout',
                'message' => 'El servicio de DHL tardó demasiado en responder. Intenta de nuevo en unos momentos.',
            ];
        }

        
        if (str_contains($msg, '[400]')) {
            return [
                'type'    => 'bad_request',
                'message' => 'DHL no pudo procesar la solicitud. Verifica que tu dirección esté completa y correcta.',
            ];
        }

        
        return [
            'type'    => 'unavailable',
            'message' => 'El servicio de envío no está disponible en este momento. Intenta en unos minutos o contáctanos por WhatsApp.',
        ];
    }
}
