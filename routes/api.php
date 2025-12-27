<?php

use App\Http\Controllers\Api\ShippingRateController;
use App\Http\Controllers\OpenpayCheckoutController;
use App\Http\Controllers\Api\UserAddressController;
use App\Http\Controllers\OpenpayWebhookController;
use App\Http\Controllers\InvoiceController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\DB;




/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::match(['get','post'], '/openpay/webhook', [OpenpayWebhookController::class, 'handle']);

Route::get('/products/{id}/reconcile-stock', function ($id) {
	$product = Product::query()->select('id_product','disponibility','active')->where('id_product', $id)->first();
	if (!$product) {
		return response()->json(['success' => false, 'message' => 'Producto no encontrado'], 404);
	}
	$remote = null;
	try {
		$refClass = new \ReflectionClass(Product::class);
		if ($refClass->hasMethod('fetchStockMap')) {
			$m = $refClass->getMethod('fetchStockMap');
			$m->setAccessible(true);
			$map = $m->invoke(null, [$product->id_product]);
			$remote = $map[$product->id_product] ?? null;
		}
	} catch (\Throwable $e) {

    }
	$adjusted = false;
	if ($remote !== null && $product->disponibility > $remote) {
		DB::table('products')->where('id_product', $product->id_product)->update(['disponibility' => (int)$remote]);
		$product->disponibility = (int)$remote;
		$adjusted = true;
	}
	return response()->json([
		'success' => true,
		'id_product' => $product->id_product,
		'local_stock' => (int) $product->disponibility,
		'remote_stock' => $remote,
		'adjusted' => $adjusted,
	]);
});

// Search product by exact code
Route::get('/products/search-by-code', function (Request $request) {
    $code = $request->query('code');
    
    if (!$code) {
        return response()->json(['success' => false, 'message' => 'Código no proporcionado'], 400);
    }
    
    $product = Product::query()
        ->where('code', '=', trim($code))
        ->where('active', true)
        ->first();
    
    if (!$product) {
        return response()->json(['success' => false, 'message' => 'Producto no encontrado'], 404);
    }
    
    return response()->json([
        'success' => true,
        'product' => [
            'id_product' => $product->id_product,
            'name' => $product->name,
            'code' => $product->code,
            'price' => $product->price,
        ]
    ]);
})->middleware('throttle:30,1');
