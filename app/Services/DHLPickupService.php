<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Str;
use App\Models\Order;

class DHLPickupService
{
    protected string $endpoint;
    protected string $username;
    protected string $password;
    protected string $account;
    protected string $pickupTime;
    protected array  $origin;

    public function __construct()
    {
    $cfg = config('services.dhl');
    $base = rtrim($cfg['base_url'], '/') . '/';
    $this->endpoint   = $base . 'pickups';
        $this->username   = $cfg['username'];
        $this->password   = $cfg['password'];
        $this->account    = $cfg['account_number'];
        $this->origin     = $cfg['origin'];
        $this->pickupTime = config('services.dhl.pickup.pickup_time', '17:00');
    }

    /**
     * Programa la recolección de un pedido individual para hoy a las 17:00
     * (o mañana si ya pasó de las 15:00), y devuelve un array que siempre
     * incluye 'dispatchConfirmationNumber'.
     *
     * @param  Order  $order
     * @return array
     * @throws RequestException
     */
    public function schedulePickupForOrder(Order $order): array
    {
        //Determinar día de pickup y ventana de 180 minutos
        $now      = Carbon::now('America/Mexico_City');
        $cutoff   = Carbon::today('America/Mexico_City')->setTime(15, 0);
        $pickupDt = $now->greaterThan($cutoff) ? $now->addDay() : $now;
        $pickupDt->setTimeFromTimeString($this->pickupTime);

        // DHL exige al menos 180 minutos de ventana entre plannedPickupDateAndTime y closeTime
        $windowStartDt = $pickupDt->copy()->subMinutes(180);

        // Formateo ISO8601 + zona
        $offset    = $pickupDt->format('P');
        $planned   = $windowStartDt->format("Y-m-d\\TH:i:s") . "GMT{$offset}";
        $closeTime = $pickupDt->format('H:i');

        $prefix    = "order{$order->id_order}-";
        $suffixLen = 36 - mb_strlen($prefix);
        $msgRef    = $prefix . Str::random($suffixLen);

        //Mapear origin a camelCase
        $originAddress = [
            'postalCode'   => $this->origin['postal_code'],
            'cityName'     => $this->origin['city_name'],
            'provinceCode' => $this->origin['province_code'],
            'countryCode'  => $this->origin['country_code'],
            'addressLine1' => $this->origin['address_line1'],
        ];

        //Payload
        $payload = [
            'plannedPickupDateAndTime' => $planned,
            'closeTime'                => $closeTime,
            'location'                 => 'recepción',
            'locationType'             => 'residence',
            'accounts'                 => [
                ['typeCode' => 'shipper', 'number' => $this->account],
            ],
            'specialInstructions'      => [
                ['value' => 'Identificarse en recepción', 'typeCode' => 'TBD'],
            ],
            'remark'                   => "Recolección pedido #{$order->id_order}",
            'customerDetails'          => [
                'shipperDetails' => [
                    'postalAddress'      => $originAddress,
                    'contactInformation' => [
                        'email'       => 'soporte-ecom@refaccioneselboom.com',
                        'phone'       => '7771807312',
                        'companyName' => 'El Boom Tractopartes',
                        'fullName'    => 'Depto. Logística',
                    ],
                ],
                'pickupDetails'  => [
                    'postalAddress'      => $originAddress,
                    'contactInformation' => [
                        'email'       => 'soporte-ecom@refaccioneselboom.com',
                        'phone'       => '7771807312',
                        'companyName' => 'El Boom Tractopartes',
                        'fullName'    => 'Depto. Logística',
                    ],
                ],
            ],
            'shipmentDetails' => [[
                'productCode'            => 'N',
                'localProductCode'       => 'N',
                'accounts'               => [['typeCode' => 'shipper', 'number' => $this->account]],
                'isCustomsDeclarable'    => false,
                'declaredValue'          => (float) $order->total_amount,
                'declaredValueCurrency'  => 'MXN',
                'unitOfMeasurement'      => 'metric',
                'packages'               => [[
                    'typeCode'   => '3BX',
                    'weight'     => (float) $order->items[0]->product->weight,
                    'dimensions' => [
                        'length' => (float) $order->items[0]->product->length,
                        'width'  => (float) $order->items[0]->product->width,
                        'height' => (float) $order->items[0]->product->height,
                    ],
                ]],
            ]],
        ];

        //Capturar payload para logs
        $rawRequest = json_encode($payload, JSON_PRETTY_PRINT);
        
        try {
            // Realizar la petición y capturar la respuesta
            $response = Http::withBasicAuth($this->username, $this->password)
                ->withHeaders([
                    'Content-Type'                    => 'application/json',
                    'Message-Reference'               => $msgRef,
                    'Message-Reference-Date'          => now()->toIso8601String() . 'Z',
                    'x-version'                       => '2.0',
                    'Shipping-System-Platform-Name'   => 'Laravel',
                    'Shipping-System-Platform-Version'=> app()->version(),
                    'Webstore-Platform-Name'          => config('app.name'),
                    'Webstore-Platform-Version'       => config('app.version', '1.0.0'),
                ]);
            
            // Ejecutar la petición y obtener la respuesta
            $httpResponse = $response->post($this->endpoint, $payload);
            $rawResponse = $httpResponse->body();
            $resp = $httpResponse->json();
            
            // // Registrar siempre el intercambio completo en los logs
            // Log::info('DHL Pickup API Exchange:', [
            //     'URL'      => $this->endpoint,
            //     'Request'  => $rawRequest,
            //     'Response' => $rawResponse,
            //     'Status'   => $httpResponse->status()
            // ]);
            
        } catch (RequestException $e) {
            // $rawResponse = $e->response ? $e->response->body() : 'No response';
            
            // // Registrar el error pero con el mismo formato
            // Log::error('DHL Pickup API Exchange (ERROR):', [
            //     'URL'      => $this->endpoint,
            //     'Request'  => $rawRequest,
            //     'Response' => $rawResponse,
            //     'Status'   => $e->response ? $e->response->status() : 500
            // ]);
            
            throw $e;
        }

        $dispatchNumber = data_get($resp, 'dispatchConfirmationNumber', data_get($resp, 'dispatchConfirmationNumbers.0'));
        $resp['dispatchConfirmationNumber'] = $dispatchNumber;

        return $resp;
    }
}
