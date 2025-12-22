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
        //Validar parámetros
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

        //Cargar Address y Product
        $address  = Address::findOrFail($request->input('address_id'));
        $product  = Product::findOrFail($request->input('product_id'));
        $quantity = $request->input('quantity', 1);
        
        //Determinar si el monto es suficiente para envío gratuito
        $cartTotal = $product->price * $quantity;
        $freeShipping = $cartTotal >= 2000;

        try {
            //Invocar al servicio DHL
            /** @var array $result */
            $result = app(DhlRateService::class)->quote($address, $product, $quantity);

            //Extraer primer producto cotizado
            $item = $result['products'][0] ?? $result['productsAndServices'][0] ?? null;
            if (! $item) {
                throw new \Exception('No se obtuvo ningún resultado de DHL');
            }

            //Obtener precio en MXN
            $priceEntry = collect($item['totalPrice'] ?? $item['totalPriceBreakdown'] ?? [])
                ->first(fn($p) => ($p['priceCurrency'] ?? $p['currency']) === 'MXN');

            $price    = $priceEntry['price'] ?? $priceEntry['priceBreakdown'][0]['price'] ?? null;
            $currency = $priceEntry['priceCurrency'] ?? $priceEntry['currency'] ?? 'MXN';
            
            // Si aplica envío gratis, guardar precio original y establecer precio a cero
            if ($freeShipping) {
                $originalPrice = $price;
                $price = 0;
            }

            //Obtener ETA
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
            return response()->json([
                'success' => false,
                'message' => 'Error al cotizar envío: ' . $e->getMessage(),
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
        //Validación
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

        //Cargar dirección
        $address = Address::findOrFail($request->input('address_id'));
        $items   = $request->input('items');

        try {
            //Calcular el total de la compra para determinar si aplica envío gratis
            $cartTotal = 0;
            foreach ($items as $item) {
                $product = Product::findOrFail($item['id_product']);
                $cartTotal += $product->price * $item['quantity'];
            }

            // Determinar si aplica envío gratis (mayor o igual a $2,000)
            $freeShipping = $cartTotal >= 2000;
            
            //Llamar al servicio DHL (siempre necesitamos los datos de envío)
            $result = app(DhlRateService::class)->quoteCart($address, $items);

            //Extraer la info del primer paquete
            $item = $result['products'][0] 
                ?? $result['productsAndServices'][0] 
                ?? null;

            if (! $item) {
                throw new \Exception('No se obtuvo ningún resultado de DHL');
            }

            //Precio en MXN
            $priceEntry = collect($item['totalPrice'] ?? $item['totalPriceBreakdown'] ?? [])
                ->first(fn($p) => ($p['priceCurrency'] ?? $p['currency']) === 'MXN');

            $price    = $priceEntry['price'] 
                    ?? $priceEntry['priceBreakdown'][0]['price'] 
                    ?? null;
            $currency = $priceEntry['priceCurrency'] 
                    ?? $priceEntry['currency'] 
                    ?? 'MXN';

            //ETA
            $eta = $item['deliveryCapabilities']['estimatedDeliveryDateAndTime']
                ?? $item['deliveryCapabilities']['estimatedDeliveryDate']
                ?? null;
                
            //Si aplica envío gratis, establecer el precio a cero
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
            return response()->json([
                'success' => false,
                'message' => 'Error al cotizar carrito: ' . $e->getMessage(),
            ], 500);
        }
    }
}
