<?php 

use App\Http\Controllers\Admin\AdminVacancyController;
use App\Http\Controllers\Api\ShippingRateController;
use App\Http\Controllers\Api\UserAddressController;
use App\Http\Controllers\OpenpayCheckoutController;
use App\Http\Controllers\OpenpayWebhookController;
use App\Http\Controllers\ProductListingController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\CatalogController;
use App\Http\Controllers\ShoppingCartController;
use App\Http\Controllers\PaymentProofController;
use App\Http\Controllers\Api\VacancyController;
use App\Http\Controllers\PostalCodeController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\OrderController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use App\Models\Product;
use Openpay\Openpay;
use Inertia\Inertia; 

//APERTURA DE RUTAS PÚBLICAS
Route::get('/', [ProductListingController::class, 'welcome'])->name('home');

// Rutas públicas amigables para tabs del home (SPA): /productos, /nosotros, etc.
Route::get('/{tab}', [ProductListingController::class, 'welcome'])
    ->where('tab', 'productos|nosotros|sucursales|vacantes|catalogos|deshuesadero|datos|terminos|soporte')
    ->name('home.tab');

// RUTAS API para vacantes y catálogos públicos
Route::prefix('api')->group(function () {
    Route::get('/vacancies', [VacancyController::class, 'index']);
    Route::get('/vacancies/{vacancy}', [VacancyController::class, 'show']);
    Route::get('/catalogs', [CatalogController::class, 'showPublic'])->name('api.catalogs'); 
});

// APERTURA RUTAS PROTEGIDAS POR AUNTENTICACIÓN Y VERIFICACIÓN USUARIO
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('dashboard', [ProductListingController::class, 'dashboard'])->name('dashboard');

    // Rutas amigables de dashboard para tabs: /dashboard/productos, /dashboard/nosotros, etc.
    Route::get('dashboard/{tab}', [ProductListingController::class, 'dashboard'])
        ->where('tab', 'productos|nosotros|sucursales|vacantes|catalogos|deshuesadero|datos|terminos|soporte')
        ->name('dashboard.tab');

    // Ruta de confirmación
    Route::get('confirmation', function () {
        return Inertia::render('confirmation', [
            'status' => session('status'),
        ]);
    })->name('confirmation');

    Route::get('upload', function () {
        return Inertia::render('upload');
    })->name('upload');

    // Ruta para guardar la dirección del usuario
    Route::post('/addresses', [AddressController::class, 'store'])
        ->name('addresses.store');

    // Ruta para obtener las direcciones del usuario autenticado
    Route::get('/addresses', [AddressController::class, 'index'])
        ->name('addresses.index');
    //CARRITO rutas para el carrito de compras
    Route::post('/cart/add', [ShoppingCartController::class, 'addItem'])->name('cart.add');
    Route::delete('/cart/remove/{id}', [ShoppingCartController::class, 'removeItem'])->name('cart.remove');
    Route::get('/cart', [ShoppingCartController::class, 'viewCart'])->name('cart.view');
    Route::put('/cart/update', [ShoppingCartController::class, 'updateItem'])->name('cart.update');
    //Ruta para cancelar compra
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancelOrder'])->name('orders.cancel');
    

    // APERTURA DEL GRUPO MIDDLEWARE DE ADMINISTRADORES
    Route::middleware(['auth', 'verified', \App\Http\Middleware\AdminMiddleware::class])->prefix('admin')->name('admin.')->group(function () {
        // Dashboard de administrador
        Route::get('/dashboard', function () { return Inertia::render('Admin/dashboard'); })->name('dashboard');
        
        Route::get('/orders/{id}', [OrderController::class, 'adminShowOrder'])->name('orders.show');
        
        //GESTION COMPROBANTES DE PAGO
        Route::get('/payment-proofs', [PaymentProofController::class, 'adminListPending'])->name('payment-proofs.pending');
        Route::post('/payment-proofs/{proofId}/approve', [PaymentProofController::class, 'adminApprove'])->name('payment-proofs.approve');
        Route::post('/payment-proofs/{proofId}/reject', [PaymentProofController::class, 'adminReject'])->name('payment-proofs.reject');

        Route::get('/orders', [OrderController::class, 'adminIndex'])->name('orders');
    
        // Ruta para actualizar el estado
        Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus'])->name('orders.status.update');
        
        //SINCPAGOS 
        Route::get('/payments/sync', [OpenpayCheckoutController::class, 'syncPaymentStatuses'])->name('payments.sync');

        //PRODUCTOS 
        Route::get('/products', [App\Http\Controllers\Admin\ProductController::class, 'index'])->name('products');
        Route::get('/products/create', [App\Http\Controllers\Admin\ProductController::class, 'create'])->name('products.create');
        Route::post('/products', [App\Http\Controllers\Admin\ProductController::class, 'store'])->name('products.store');
        Route::get('/products/{id}/edit', [App\Http\Controllers\Admin\ProductController::class, 'edit'])->name('products.edit');
        Route::put('/products/{id}', [App\Http\Controllers\Admin\ProductController::class, 'update'])->name('products.update');
        Route::delete('/products/{id}', [App\Http\Controllers\Admin\ProductController::class, 'destroy'])->name('products.destroy');
        Route::put('/products/{id}/toggle-status', [ProductController::class, 'toggleStatus'])->name('products.toggle-status');
        Route::post('/products/sync-stock', [ProductController::class, 'syncStock'])->name('products.sync-stock');
        Route::post('/products/sync-stock-incidences', [ProductController::class, 'syncStockIncidences'])->name('products.sync-stock-incidences');
        // Audio management for bocina products
        Route::post('/products/{id}/audio', [ProductController::class, 'uploadAudio'])->name('products.audio.upload');
        Route::delete('/products/{id}/audio', [ProductController::class, 'deleteAudio'])->name('products.audio.delete');
        // Incidencias de stock (sobreventa) 
        Route::get('/products/incidences', [ProductController::class, 'incidences'])->name('products.incidences');
        Route::get('/products/incidences-count', [ProductController::class, 'incidencesCount'])->name('products.incidences-count');

        //PDF  para descargar el PDF de orden de surtido
        Route::get('/orders/{id}/shipping-pdf', [OrderController::class, 'downloadShippingPdf'])->name('orders.shipping-pdf');
        // Etiqueta DHL (descarga protegida)
        Route::get('/orders/{id}/label-pdf', [OrderController::class, 'downloadDhlLabel'])->name('orders.label-pdf');
        Route::get('/products/out-of-stock-report', [ProductController::class, 'generateOutOfStockReport'])->name('admin.products.out-of-stock-report');
        
        //APERTURA Rutas para vacantes (simplificadas)
        Route::resource('vacancies', AdminVacancyController::class);
        Route::put('/vacancies/{vacancy}/toggle-status', [AdminVacancyController::class, 'toggleStatus'])->name('vacancies.toggle-status');
        Route::post('/vacancies/{vacancy}/duplicate', [AdminVacancyController::class, 'duplicate'])->name('vacancies.duplicate');

        // DHL Pickups
        Route::get('/dhl-pickups', [\App\Http\Controllers\Admin\DhlPickupController::class, 'index'])->name('dhl-pickups.index');

        //APERTURA Rutas para catálogos
        Route::resource('catalogs', \App\Http\Controllers\Admin\CatalogController::class);
        Route::put('catalogs/{id}/toggle-active', [\App\Http\Controllers\Admin\CatalogController::class, 'toggleActive'])->name('catalogs.toggle-active');
        Route::post('catalogs/reorder', [\App\Http\Controllers\Admin\CatalogController::class, 'reorder'])->name('catalogs.reorder');

        // Orden de tipos de productos
        Route::get('/product-type-order', [\App\Http\Controllers\Admin\ProductTypeOrderController::class, 'index'])->name('product-types.order');
        Route::post('/product-type-order', [\App\Http\Controllers\Admin\ProductTypeOrderController::class, 'save'])->name('product-types.order.save');

        // Familias de productos (agrupaciones)
        Route::get('/product-families', [\App\Http\Controllers\Admin\ProductFamilyController::class, 'index'])->name('product-families.index');
        Route::post('/product-families/assign', [\App\Http\Controllers\Admin\ProductFamilyController::class, 'assign'])->name('product-families.assign');
        Route::post('/product-families/clear', [\App\Http\Controllers\Admin\ProductFamilyController::class, 'clear'])->name('product-families.clear');
        Route::post('/product-families/opt-out', [\App\Http\Controllers\Admin\ProductFamilyController::class, 'optOut'])->name('product-families.opt-out');
        Route::post('/product-families/set-color', [\App\Http\Controllers\Admin\ProductFamilyController::class, 'setColor'])->name('product-families.set-color');
        Route::post('/product-families/delete', [\App\Http\Controllers\Admin\ProductFamilyController::class, 'deleteFamily'])->name('product-families.delete');
        Route::get('/product-families/create', [\App\Http\Controllers\Admin\ProductFamilyController::class, 'create'])->name('product-families.create');
        Route::get('/product-families/view', [\App\Http\Controllers\Admin\ProductFamilyController::class, 'show'])->name('product-families.view');
    }); //CIERRE DEL GRUPO MIDDLEWARE DE ADMINISTRADORES

    // Rutas para órdenes de pago manual
    Route::post('/orders', [OrderController::class, 'createOrder'])->name('orders.create');
    Route::get('/orders', [OrderController::class, 'getUserOrders'])->name('orders.list');
    Route::get('/orders/{id}', [OrderController::class, 'show'])->name('orders.show');
    
    // Rutas para comprobantes de pago
    Route::post('/orders/{orderId}/payment-proof', [PaymentProofController::class, 'uploadProof'])->name('payment-proof.upload');
    
    //OPENPAY para Openpay (redirecciones de vuelta)
    Route::post('/api/create-openpay-checkout', [OpenpayCheckoutController::class, 'createCheckout'])
        ->name('api.openpay.checkout');

    //RUTAS para páginas de respuesta de Openpay
    Route::get('/payment-success', [OpenpayCheckoutController::class, 'showSuccessPage'])
        ->name('payment.success.page')
        ->withoutMiddleware([HandleInertiaRequests::class]);

    Route::get('/payment-cancelled', [OpenpayCheckoutController::class, 'showCancelledPage'])
        ->name('payment.cancelled.page')
        ->withoutMiddleware([HandleInertiaRequests::class]);

    Route::get('/payment-error-page', [OpenpayCheckoutController::class, 'showErrorPage'])
        ->name('payment.error.page')
        ->withoutMiddleware([HandleInertiaRequests::class]);

    // Página intermedia para capturar el botón "Atrás" del navegador desde Openpay
    Route::get('/payment-back-handler', function () {
        return view('payment.back-handler');
    })
        ->name('payment.back.handler')
        ->withoutMiddleware([\App\Http\Middleware\HandleInertiaRequests::class]);
        //CIERRE RUTAS
    
}); //CIERRE DEL GRUPO DE RUTAS PROTEGIDAS POR AUNTENTICACIÓN Y VERIFICACIÓN USUARIO

Route::middleware(['web', 'auth:web', 'verified'])  
    ->post('/invoices/upload-constancia', [InvoiceController::class, 'uploadConstancia'])
    ->name('invoices.upload-constancia');

Route::get('/postal-info/{cp}', [PostalCodeController::class, 'show']);
Route::get('/catalogs', [CatalogController::class, 'showPublic'])->name('catalogs');

Route::get('/dhl/rate', [ShippingRateController::class, 'rate']);
Route::post('/api/dhl/rate-cart', [ShippingRateController::class, 'rateCart'])->name('dhl.rateCart');

Route::get('/user/addresses', [UserAddressController::class, 'getAllAddresses']);

Route::match(['get', 'post'], '/openpay/webhook', [OpenpayWebhookController::class, 'handle'])
    ->name('openpay.webhook')
    ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);

// Ruta para manejar la cancelación por navegación
Route::get('/payment-cancelled-by-navigation', [\App\Http\Controllers\PaymentCancelController::class, 'handleNavigationCancel'])
    ->name('payment.navigation.cancel')
    ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
