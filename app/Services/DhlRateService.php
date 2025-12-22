<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Carbon;
use App\Models\Address;
use App\Models\Product;
use Exception;

class DhlRateService
{
    protected string $baseUrl;
    protected string $username;
    protected string $password;
    protected string $accountNumber;
    protected array  $origin;

    public function __construct()
    {
        $config = config('services.dhl');

    // Normalizar base: siempre terminar en '/'
    $this->baseUrl       = rtrim($config['base_url'], '/') . '/';
        $this->username      = $config['username'];
        $this->password      = $config['password'];
        $this->accountNumber = $config['account_number'];
        $this->origin        = $config['origin'];
    }

    /**
     * Ajusta la fecha de recolección: si es sábado o domingo, la mueve al lunes siguiente.
     */
    protected function getNextPickupDateTime(): Carbon
    {
        $date = now()->setTime(18, 0, 0);

        // Si es sábado (6), sumamos 2 días; si es domingo (0), sumamos 1 día
        if ($date->isSaturday()) {
            $date->addDays(2);
        } elseif ($date->isSunday()) {
            $date->addDay();
        }

        return $date;
    }

    /**
     * Obtiene cotización de DHL Express para un solo producto.
     *
     * @param  Address $address
     * @param  Product $product
     * @param  int     $quantity
     * @return array
     * @throws Exception
     */
    public function quote(Address $address, Product $product, int $quantity = 1): array
    {
        $packages = [];
        for ($i = 0; $i < $quantity; $i++) {
            $packages[] = [
                'weight'     => (float) $product->weight,
                'dimensions' => [
                    'length' => (float) $product->length,
                    'width'  => (float) $product->width,
                    'height' => (float) $product->height,
                ],
            ];
        }

        $pickupDate = $this->getNextPickupDateTime();

        $payload = [
            'customerDetails' => [
                'shipperDetails'  => [
                    'postalCode'   => $this->origin['postal_code'],
                    'cityName'     => $this->origin['city_name'],
                    'countryCode'  => $this->origin['country_code'],
                    'provinceCode' => $this->origin['province_code'],
                    'addressLine1' => $this->origin['address_line1'],
                ],
                'receiverDetails' => [
                    'postalCode'   => $address->codigo_postal,
                    'cityName'     => $address->ciudad,
                    'countryCode'  => 'MX',
                    'provinceCode' => $address->estado,
                    'addressLine1' => trim("{$address->calle} {$address->numero_exterior} {$address->numero_interior}"),
                ],
            ],
            'accounts' => [
                [
                    'typeCode' => 'shipper',
                    'number'   => $this->accountNumber,
                ],
            ],
            'productsAndServices' => [
                [
                    'productCode'      => 'N',
                    'localProductCode' => 'N',
                ],
            ],
            'plannedShippingDateAndTime' => $pickupDate->toIso8601String(),
            'unitOfMeasurement'   => 'metric',
            'isCustomsDeclarable' => false,
            'packages'            => $packages,
        ];

        //Request para logs
        $rawRequest = json_encode($payload, JSON_PRETTY_PRINT);
    $url = "{$this->baseUrl}rates";
        
        $response = Http::withBasicAuth($this->username, $this->password)
                        ->acceptJson()
                        ->post($url, $payload);
        
        // // Capturar response para logs
        // $rawResponse = $response->body();
        
        // // Registrar en logs
        // \Log::info('DHL Rate API Exchange:', [
        //     'URL'      => $url,
        //     'Request'  => $rawRequest,
        //     'Response' => $rawResponse,
        //     'Status'   => $response->status()
        // ]);

        if ($response->successful()) {
            return $response->json();
        }

        throw new Exception("DHL Rate Error [{$response->status()}]: {$response->body()}");
    }

    /**
     * Obtiene cotización de DHL Express para un solo producto
     * y captura el request/response crudos.
     *
     * @param  Address $address
     * @param  Product $product
     * @param  int     $quantity
     * @return array
     */
    public function getRawRequestResponse(Address $address, Product $product, int $quantity = 1): array
    {
        $packages = [];
        for ($i = 0; $i < $quantity; $i++) {
            $packages[] = [
                'weight'     => (float) $product->weight,
                'dimensions' => [
                    'length' => (float) $product->length,
                    'width'  => (float) $product->width,
                    'height' => (float) $product->height,
                ],
            ];
        }

        $pickupDate = $this->getNextPickupDateTime();

        $payload = [
            'customerDetails' => [
                'shipperDetails'  => [
                    'postalCode'   => $this->origin['postal_code'],
                    'cityName'     => $this->origin['city_name'],
                    'countryCode'  => $this->origin['country_code'],
                    'provinceCode' => $this->origin['province_code'],
                    'addressLine1' => $this->origin['address_line1'],
                ],
                'receiverDetails' => [
                    'postalCode'   => $address->codigo_postal,
                    'cityName'     => $address->ciudad,
                    'countryCode'  => 'MX',
                    'provinceCode' => $address->estado,
                    'addressLine1' => trim("{$address->calle} {$address->numero_exterior} {$address->numero_interior}"),
                ],
            ],
            'accounts' => [
                [
                    'typeCode' => 'shipper',
                    'number'   => $this->accountNumber,
                ],
            ],
            'productsAndServices' => [
                [
                    'productCode'      => 'N',
                    'localProductCode' => 'N',
                ],
            ],
            'plannedShippingDateAndTime' => $pickupDate->toIso8601String(),
            'unitOfMeasurement'   => 'metric',
            'isCustomsDeclarable' => false,
            'packages'            => $packages,
        ];

        $rawRequest  = json_encode($payload, JSON_PRETTY_PRINT);
        $response    = Http::withBasicAuth($this->username, $this->password)
                        ->acceptJson()
                        ->withHeaders(['Content-Type' => 'application/json'])
                        ->post("{$this->baseUrl}rates", $payload);
        $rawResponse = $response->body();

        return [
            'url'      => "{$this->baseUrl}rates",
            'request'  => $rawRequest,
            'response' => $rawResponse,
            'status'   => $response->status(),
            'headers'  => [
                'request'  => [
                    'Content-Type'  => 'application/json',
                    'Authorization' => 'Basic: [CREDENCIALES]',
                ],
                'response' => $response->headers(),
            ],
        ];
    }

    /**
     * Obtiene cotización de DHL Express para múltiples productos (carrito)
     * agrupándolos en un solo paquete.
     *
     * @param  Address $address
     * @param  array   $items    Cada item: ['id_product'=>int, 'quantity'=>int]
     * @return array             Respuesta JSON de DHL
     * @throws Exception
     */
    public function quoteCart(Address $address, array $items): array
    {

        $totalWeight = 0.0;
        $maxLength   = 0.0;
        $maxWidth    = 0.0;
        $maxHeight   = 0.0;
        $logProducts = [];

        // Calcular peso total y dimensiones máximas
        foreach ($items as $item) {
            $product  = Product::findOrFail($item['id_product']);
            $quantity = max(1, (int) $item['quantity']);
            $totalWeight += (float) $product->weight * $quantity;
            $maxLength   = max($maxLength,   (float) $product->length);
            $maxWidth    = max($maxWidth,    (float) $product->width);
            $maxHeight   = max($maxHeight,   (float) $product->height);
            $logProducts[] = [
                'id_product' => $product->id_product ?? $product->id,
                'name'       => $product->name ?? $product->nombre,
                'quantity'   => $quantity,
                'weight'     => $product->weight,
                'length'     => $product->length,
                'width'      => $product->width,
                'height'     => $product->height,
            ];
        }

        \Log::info('[DHL] Carrito para cotización', [
            'products'    => $logProducts,
            'totalWeight' => $totalWeight,
            'maxLength'   => $maxLength,
            'maxWidth'    => $maxWidth,
            'maxHeight'   => $maxHeight,
        ]);

        
        $packages = [
            [
                'weight'     => $totalWeight,
                'dimensions' => [
                    'length' => $maxLength,
                    'width'  => $maxWidth,
                    'height' => $maxHeight,
                ],
            ],
        ];

        $pickupDate = $this->getNextPickupDateTime();

        
        $payload = [
            'customerDetails' => [
                'shipperDetails'  => [
                    'postalCode'   => $this->origin['postal_code'],
                    'cityName'     => $this->origin['city_name'],
                    'countryCode'  => $this->origin['country_code'],
                    'provinceCode' => $this->origin['province_code'],
                    'addressLine1' => $this->origin['address_line1'],
                ],
                'receiverDetails' => [
                    'postalCode'   => $address->codigo_postal,
                    'cityName'     => $address->ciudad,
                    'countryCode'  => 'MX',
                    'provinceCode' => $address->estado,
                    'addressLine1' => trim("{$address->calle} {$address->numero_exterior} {$address->numero_interior}"),
                ],
            ],
            'accounts' => [
                [
                    'typeCode' => 'shipper',
                    'number'   => $this->accountNumber,
                ],
            ],
            'productsAndServices' => [
                [
                    'productCode'      => 'N',
                    'localProductCode' => 'N',
                ],
            ],
            'plannedShippingDateAndTime' => $pickupDate->toIso8601String(),
            'unitOfMeasurement'   => 'metric',
            'isCustomsDeclarable' => false,
            'packages'            => $packages,
        ];

        // // Capturar request para logs
        $rawRequest = json_encode($payload, JSON_PRETTY_PRINT);
    $url = "{$this->baseUrl}rates";
        
        $response = Http::withBasicAuth($this->username, $this->password)
                        ->acceptJson()
                        ->post($url, $payload);
        
        // // Capturar response para logs
        // $rawResponse = $response->body();
        
        // // Registrar en logs
        // \Log::info(' DHL Rate Cart API Exchange:', [
        //     'URL'      => $url,
        //     'Request'  => $rawRequest,
        //     'Response' => $rawResponse,
        //     'Status'   => $response->status()
        // ]);

        if ($response->successful()) {
            return $response->json();
        }

        throw new Exception("DHL Rate Error [{$response->status()}]: {$response->body()}");
    }

}
