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

        if (!$config || empty($config['username']) || empty($config['password']) || empty($config['account_number'])) {
            throw new Exception("DHL Configuration is missing or incomplete in services.dhl");
        }

        // Normalizar base: siempre terminar en '/'
        $this->baseUrl       = rtrim($config['base_url'], '/') . '/';
        $this->username      = $config['username'];
        $this->password      = $config['password'];
        $this->accountNumber = $config['account_number'];
        $this->origin        = $config['origin'] ?? [];

        if (empty($this->origin['postal_code'])) {
            throw new Exception("DHL Origin configuration (postal_code) is missing");
        }
    }

    /**
     * Ajusta la fecha de recolección: si ya pasaron las 10:00 AM, la mueve al día siguiente
     * para asegurar que el "pickup" sea siempre en el futuro.
     * Si es sábado o domingo, la mueve al lunes siguiente.
     */
    protected function getNextPickupDateTime(): Carbon
    {
        // Usamos la zona horaria de México para la lógica de negocio si es necesario,
        // pero DHL prefiere ISO8601 con offset correcto.
        $date = now();
        
        // Si hoy a las 11:00 AM ya pasó o está muy cerca (menos de 2 horas), 
        // programamos para el día siguiente.
        $todayPickup = clone $date;
        $todayPickup->setTime(11, 0, 0);

        if ($date->greaterThanOrEqualTo($todayPickup->subHours(1))) {
            $date->addDay();
        }

        $date->setTime(11, 0, 0); // Recolección a las 11:00 AM

        // Si el resultado cae en fin de semana, mover al lunes
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
                'weight'     => (float) $product->weight <= 0 ? 0.5 : (float) $product->weight,
                'dimensions' => [
                    'length' => (float) $product->length <= 0 ? 10 : (float) $product->length,
                    'width'  => (float) $product->width  <= 0 ? 10 : (float) $product->width,
                    'height' => (float) $product->height <= 0 ? 10 : (float) $product->height,
                ],
            ];
        }

        $pickupDate = $this->getNextPickupDateTime();

        $payload = [
            'customerDetails' => [
                'shipperDetails'  => [
                    'postalCode'   => $this->origin['postal_code'],
                    'cityName'     => $this->origin['city_name'] ?? '',
                    'countryCode'  => $this->origin['country_code'] ?? 'MX',
                    'provinceCode' => $this->origin['province_code'] ?? '',
                    'addressLine1' => $this->origin['address_line1'] ?? '',
                ],
                'receiverDetails' => [
                    'postalCode'   => $address->codigo_postal,
                    'cityName'     => $address->ciudad ?? '',
                    'countryCode'  => 'MX',
                    'provinceCode' => $address->estado ?? '',
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

        $url = "{$this->baseUrl}rates";
        
        try {
            $response = Http::withBasicAuth($this->username, $this->password)
                            ->acceptJson()
                            ->timeout(10)
                            ->post($url, $payload);
            
            if ($response->successful()) {
                return $response->json();
            }

            $errorBody = $response->body();
            \Log::error("DHL API Error Response:", ['status' => $response->status(), 'body' => $errorBody, 'payload' => $payload]);
            
            throw new Exception("DHL API Error [{$response->status()}]: " . ($response->json()['detail'] ?? $errorBody));
        } catch (\Exception $e) {
            \Log::error("DHL Service Exception: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Obtiene cotización de DHL Express para un solo producto
     * y captura el request/response crudos.
     */
    public function getRawRequestResponse(Address $address, Product $product, int $quantity = 1): array
    {
        $pickupDate = $this->getNextPickupDateTime();
        
        $payload = [
            'customerDetails' => [
                'shipperDetails' => [
                    'postalCode' => $this->origin['postal_code'],
                    'cityName' => $this->origin['city_name'] ?? '',
                    'countryCode' => $this->origin['country_code'] ?? 'MX',
                    'provinceCode' => $this->origin['province_code'] ?? '',
                    'addressLine1' => $this->origin['address_line1'] ?? '',
                ],
                'receiverDetails' => [
                    'postalCode' => $address->codigo_postal,
                    'cityName' => $address->ciudad ?? '',
                    'countryCode' => 'MX',
                    'provinceCode' => $address->estado ?? '',
                    'addressLine1' => trim("{$address->calle} {$address->numero_exterior} {$address->numero_interior}"),
                ],
            ],
            'accounts' => [['typeCode' => 'shipper', 'number' => $this->accountNumber]],
            'productsAndServices' => [['productCode' => 'N', 'localProductCode' => 'N']],
            'plannedShippingDateAndTime' => $pickupDate->toIso8601String(),
            'unitOfMeasurement' => 'metric',
            'isCustomsDeclarable' => false,
            'packages' => [[
                'weight' => (float) $product->weight ?: 0.5,
                'dimensions' => [
                    'length' => (float) $product->length ?: 10,
                    'width' => (float) $product->width ?: 10,
                    'height' => (float) $product->height ?: 10,
                ]
            ]],
        ];

        $response = Http::withBasicAuth($this->username, $this->password)
                        ->acceptJson()
                        ->withHeaders(['Content-Type' => 'application/json'])
                        ->post("{$this->baseUrl}rates", $payload);

        return [
            'url'      => "{$this->baseUrl}rates",
            'request'  => json_encode($payload, JSON_PRETTY_PRINT),
            'response' => $response->body(),
            'status'   => $response->status(),
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

        foreach ($items as $item) {
            $product  = Product::findOrFail($item['id_product']);
            $quantity = max(1, (int) $item['quantity']);
            $totalWeight += ((float) $product->weight ?: 0.5) * $quantity;
            $maxLength   = max($maxLength,   (float) $product->length ?: 10);
            $maxWidth    = max($maxWidth,    (float) $product->width ?: 10);
            $maxHeight   = max($maxHeight,   (float) $product->height ?: 10);
        }
        
        $packages = [[
            'weight'     => $totalWeight,
            'dimensions' => [
                'length' => $maxLength,
                'width'  => $maxWidth,
                'height' => $maxHeight,
            ],
        ]];

        $pickupDate = $this->getNextPickupDateTime();

        $payload = [
            'customerDetails' => [
                'shipperDetails'  => [
                    'postalCode'   => $this->origin['postal_code'],
                    'cityName'     => $this->origin['city_name'] ?? '',
                    'countryCode'  => $this->origin['country_code'] ?? 'MX',
                    'provinceCode' => $this->origin['province_code'] ?? '',
                    'addressLine1' => $this->origin['address_line1'] ?? '',
                ],
                'receiverDetails' => [
                    'postalCode'   => $address->codigo_postal,
                    'cityName'     => $address->ciudad ?? '',
                    'countryCode'  => 'MX',
                    'provinceCode' => $address->estado ?? '',
                    'addressLine1' => trim("{$address->calle} {$address->numero_exterior} {$address->numero_interior}"),
                ],
            ],
            'accounts' => [['typeCode' => 'shipper', 'number' => $this->accountNumber]],
            'productsAndServices' => [['productCode' => 'N', 'localProductCode' => 'N']],
            'plannedShippingDateAndTime' => $pickupDate->toIso8601String(),
            'unitOfMeasurement'   => 'metric',
            'isCustomsDeclarable' => false,
            'packages'            => $packages,
        ];

        $url = "{$this->baseUrl}rates";
        
        try {
            $response = Http::withBasicAuth($this->username, $this->password)
                            ->acceptJson()
                            ->timeout(10)
                            ->post($url, $payload);
            
            if ($response->successful()) {
                return $response->json();
            }

            $errorBody = $response->body();
            \Log::error("DHL API Cart Error Response:", ['status' => $response->status(), 'body' => $errorBody, 'payload' => $payload]);
            
            throw new Exception("DHL API Error [{$response->status()}]: " . ($response->json()['detail'] ?? $errorBody));
        } catch (\Exception $e) {
            \Log::error("DHL Cart Service Exception: " . $e->getMessage());
            throw $e;
        }
    }
}