<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Warehouse Database Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for external warehouse database integration
    |
    */

    'group_clave' => env('WAREHOUSE_GROUP_CLAVE'),
    
    'stock_almacen_id' => (int) env('WAREHOUSE_STOCK_ALMACEN_ID', 1),
    
    'price_ttl' => (int) env('WAREHOUSE_PRICE_TTL', 1800),
    
    'stock_ttl' => (int) env('WAREHOUSE_STOCK_TTL', 300),
    
    'stock_use_remote' => (bool) env('WAREHOUSE_STOCK_USE_REMOTE', false),
    
    'fallback_local' => (bool) env('WAREHOUSE_FALLBACK_LOCAL', true),
    
    'stock_fallback_local' => (bool) env('WAREHOUSE_STOCK_FALLBACK_LOCAL', true),
    
    'stock_auto_sync_local' => (bool) env('WAREHOUSE_STOCK_AUTO_SYNC_LOCAL', false),
];
