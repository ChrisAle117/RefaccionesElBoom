<?php

namespace App\Console\Commands;

use App\Models\Address;
use App\Models\Product;
use App\Services\DhlRateService;
use Illuminate\Console\Command;

class GetDhlRawData extends Command
{
    protected $signature = 'dhl:raw-data {productId} {addressId} {quantity=1}';

    protected $description = 'Obtiene los datos crudos del request y response de DHL para un producto y dirección';

    public function handle()
    {
        // Obtener los modelos
        $productId = $this->argument('productId');
        $addressId = $this->argument('addressId');
        $quantity = (int) $this->argument('quantity');

        $product = Product::findOrFail($productId);
        $address = Address::findOrFail($addressId);

        $this->info("Obteniendo datos crudos para Producto #{$productId} y Dirección #{$addressId}");

        // Obtener los datos crudos
        $dhlService = new DhlRateService();
        $rawData = $dhlService->getRawRequestResponse($address, $product, $quantity);

        // Mostrar los datos en consola
        $this->info("URL: {$rawData['url']}");
        
        $this->newLine();
        $this->info("REQUEST CRUDO:");
        $this->line($rawData['request']);
        
        $this->newLine();
        $this->info("RESPONSE CRUDO:");
        $this->line($rawData['response']);
        
        $this->newLine();
        $this->info("ESTADO: {$rawData['status']}");

        // Guardar los datos en archivos para fácil acceso
        $timestamp = now()->format('Y-m-d_His');
        $requestFile = storage_path("app/dhl_request_{$timestamp}.json");
        $responseFile = storage_path("app/dhl_response_{$timestamp}.json");

        file_put_contents($requestFile, $rawData['request']);
        file_put_contents($responseFile, $rawData['response']);

        $this->newLine();
        $this->info("Los datos se han guardado en los siguientes archivos:");
        $this->line("Request: {$requestFile}");
        $this->line("Response: {$responseFile}");
    }
}
