<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\AsCommand;
use Illuminate\Console\Command;
use App\Models\Product;

#[AsCommand(name: 'warehouse:sync-stock', description: 'Sincroniza la existencia del almacén hacia la columna local disponibility')]
class SyncWarehouseStock extends Command
{
    protected $signature = 'warehouse:sync-stock {--id=* : Uno o más id_product a sincronizar} {--all : Sincronizar todos los productos activos}';

    protected $description = 'Sincroniza la existencia del almacén hacia la columna local disponibility';

    public function handle()
    {
        $ids = collect($this->option('id'))
            ->map(fn($v) => is_numeric($v) ? (int) $v : null)
            ->filter()
            ->values()
            ->all();

        if ($this->option('all')) {
            $this->info('Obteniendo ids de todos los productos activos...');
            $ids = Product::query()->where('active', true)->pluck('id_product')->toArray();
        }

        if (empty($ids)) {
            $this->warn('No se especificaron ids ni --all. Nada que sincronizar.');
            return 0;
        }

        $this->info('Sincronizando stock para ' . count($ids) . ' productos...');
        Product::syncLocalStock($ids);
        $this->info('Sincronización completada.');
        return 0;
    }
}
