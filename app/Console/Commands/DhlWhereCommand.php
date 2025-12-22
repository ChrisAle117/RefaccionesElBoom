<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class DhlWhereCommand extends Command
{
    protected $signature = 'dhl:where';
    protected $description = 'Show effective DHL base_url and resolved endpoints (no network calls).';

    public function handle(): int
    {
        $env        = app()->environment();
        $base       = (string) config('services.dhl.base_url');
        $normalized = rtrim($base, '/') . '/';

        $shipments = $normalized . 'shipments';
        $rates     = $normalized . 'rates';
        $pickups   = $normalized . 'pickups';

        $this->info('DHL configuration (effective)');
        $this->line(' APP_ENV:                ' . $env);
        $this->line(' DHL_BASE_URL (raw):     ' . ($base ?: '(empty)'));
        $this->line(' base_url normalized:    ' . $normalized);
        $this->line(' Shipments endpoint:     ' . $shipments);
        $this->line(' Rates endpoint:         ' . $rates);
        $this->line(' Pickups endpoint:       ' . $pickups);

        return self::SUCCESS;
    }
}
