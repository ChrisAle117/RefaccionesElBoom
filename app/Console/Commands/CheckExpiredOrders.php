<?php

namespace App\Console\Commands;

use App\Http\Controllers\OrderController;
use Illuminate\Console\Command;

class CheckExpiredOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:check-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verifica las órdenes expiradas y devuelve los productos al inventario';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $controller = new OrderController();
        $result = $controller->checkExpiredOrders();
        
        $processed = json_decode($result->getContent())->processed;
        $this->info("Se procesaron {$processed} órdenes expiradas");
        
        return Command::SUCCESS;
    }
}