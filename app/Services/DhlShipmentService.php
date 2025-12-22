<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use App\Models\Order;

class DhlShipmentService
{
    protected Client $http;
    protected string $account;
    protected array  $origin;

    public function __construct()
    {
        $this->http = new Client([
            'base_uri' => rtrim(config('services.dhl.base_url'), '/') . '/',
            'auth'     => [
                config('services.dhl.username'),
                config('services.dhl.password'),
            ],
            'headers'  => [
                'Accept'       => 'application/json',
                'Content-Type' => 'application/json',
            ],
        ]);

        $this->account = config('services.dhl.account_number');
        $this->origin  = config('services.dhl.origin');
    }

    /**
     * Crea un envío DHL para el Order dado.
     *
     * @param  Order  $order
     * @return array  ['tracking'=>string, 'label'=>string]
     */
    public function createShipment(Order $order): array
    {
        
        $shipperDetails = [
            'postalAddress' => [
                'postalCode'   => $this->origin['postal_code'],
                'cityName'     => $this->origin['city_name'],
                'provinceCode' => $this->origin['province_code'],
                'countryCode'  => $this->origin['country_code'],
                'addressLine1' => $this->origin['address_line1'],
            ],
            'contactInformation' => [
                'companyName' => 'El Boom',
                'fullName'    => 'Tractopartes',
                'phone'       => '777-180-7312'
            ],
        ];

        
        $addr = $order->address;
        $receiverDetails = [
            'postalAddress' => [
                'postalCode'   => $addr->codigo_postal,
                'cityName'     => $addr->ciudad,
                'provinceCode' => $addr->estado,
                'countryCode'  => 'MX',
                'addressLine1' => trim("{$addr->calle} {$addr->numero_exterior} {$addr->numero_interior}"),
            ],
            'contactInformation' => [
                'companyName' => $addr->referencia ?: $order->user->name,
                'fullName'    => $order->user->name,
                'phone'       => $addr->telefono,
                'email'       => $order->user->email,
            ],
        ];

        
        $pieces = [];
        foreach ($order->items as $item) {
            $prod = $item->product;

            $w = max(0.001, (float) $prod->weight); 
            $l = max(0.1,   (float) $prod->length); 
            $wz = max(0.1,  (float) $prod->width);
            $h = max(0.1,   (float) $prod->height);

                $pieces[] = [
                    'weight'     => (float) number_format($w, 3, '.', ''),  
                    'dimensions' => [
                    'length' => (float) number_format($l, 1, '.', ''),  
                    'width'  => (float) number_format($wz, 1, '.', ''),
                    'height' => (float) number_format($h, 1, '.', ''),
                ],
                'customerReferences' => [
                    ['value' => "#{$order->id_order}-item{$prod->id_product}x{$item->quantity}"]
                ],
            ];
        }

        
        $dt     = now();                                  
        $base   = $dt->format('Y-m-d\TH:i:s');            
        $offset = $dt->format('P');                       
        $when   = "{$base}GMT{$offset}";                  

        
        $body = [
            'productCode'                => 'N',
            'plannedShippingDateAndTime' => $when,
            'pickup'                     => ['isRequested' => false],
            'accounts'                   => [[
                'typeCode' => 'shipper',
                'number'   => $this->account,
            ]],
            'outputImageProperties'      => [
                'imageOptions' => [
                    ['typeCode' => 'label',      'templateName' => 'ECOM26_84_001'],
                    ['typeCode' => 'waybillDoc', 'templateName' => 'ARCH_8X4', 'isRequested' => true],
                ],
                'allDocumentsInOneImage'            => true,
                'splitDocumentsByPages'             => true,
                'splitTransportAndWaybillDocLabels' => true,
            ],
            'customerDetails' => [
                'shipperDetails'  => $shipperDetails,
                'receiverDetails' => $receiverDetails,
            ],
            'content' => [
                'unitOfMeasurement'   => 'metric',
                'incoterm'            => 'DAP',
                'description'         => "Pedido #{$order->id_order}",
                'isCustomsDeclarable' => false,
                'packages'            => $pieces,
                'declaredValue' => (float) number_format((float) $order->total_amount, 2, '.', ''),
                'declaredValueCurrency' => 'MXN',
            ],
        ];

        
    $rawRequest = json_encode($body, JSON_PRETTY_PRINT);
    // Construir la URL/endpoint según el base_url configurado (sandbox o prod)
    $endpoint = 'shipments';
    $url = rtrim(config('services.dhl.base_url'), '/') . '/' . $endpoint;
        
    $response = $this->http->post($endpoint, ['json' => $body]);
        $rawResponse = $response->getBody()->getContents();
        $data = json_decode($rawResponse, true);
        
        // // Formatear el JSON de respuesta para que sea legible en los logs
        // $formattedResponse = $rawResponse;
        // if (json_decode($rawResponse) !== null) {
        //     $formattedResponse = json_encode(json_decode($rawResponse), JSON_PRETTY_PRINT);
        // }
        
        // // Registrar en logs
        // \Log::info('DHL Shipment API Exchange:', [
        //     'URL' => $url,
        //     'Request' => $rawRequest,
        //     'Response' => $formattedResponse,
        //     'Status' => $response->getStatusCode()
        // ]);

        // ---- EXTRAER EL BASE64 DEL PDF ----
        
        $base64 = data_get($data, 'outputImage.labelImage');

        
        if (!$base64) {
            $base64 = data_get($data, 'documents.0.content');
        }


        
        $pdf  = base64_decode($base64);
        $file = "dhl_labels/{$order->id_order}_" . Str::random(6) . '.pdf';
        Storage::disk('public')->put($file, $pdf);

        \Log::info(" Etiqueta DHL guardada: {$file} ({$order->id_order})");

        
        return [
            'tracking' => data_get($data, 'shipmentTrackingNumber'),
            'label'    => $file,
        ];
    }
}
