<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CatalogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Limpiar la tabla antes de insertar nuevos datos
        DB::table('catalogs')->truncate();
        
        // Insertar catálogos de ejemplo
        DB::table('catalogs')->insert([
            [
                'title' => 'Catálogo Faros LED 2025',
                'image' => '/images/faro.png',
                'alt' => 'Catálogo de faros LED para camiones y vehículos pesados',
                'url' => '/storage/catalogs/faros-led-2025.pdf',
                'active' => true,
                'order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Catálogo Plafones 2025',
                'image' => '/images/plafon.webp',
                'alt' => 'Catálogo de plafones LED para cabinas',
                'url' => '/storage/catalogs/plafones-2025.pdf',
                'active' => true,
                'order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Catálogo General Refacciones',
                'image' => '/images/trailer.png',
                'alt' => 'Catálogo general de refacciones para camiones',
                'url' => '/storage/catalogs/refacciones-general-2025.pdf',
                'active' => true,
                'order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Lista de Precios 2025',
                'image' => '/images/logotipo.png',
                'alt' => 'Lista de precios actualizada 2025',
                'url' => '/storage/catalogs/precios-2025.pdf',
                'active' => true,
                'order' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Catálogo Espejos y Accesorios',
                'image' => '/images/trailer.png',
                'alt' => 'Catálogo de espejos retrovisores y accesorios',
                'url' => '/storage/catalogs/espejos-accesorios-2025.pdf',
                'active' => true,
                'order' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Guía de Instalación',
                'image' => '/images/logotipo.png',
                'alt' => 'Guía de instalación de refacciones',
                'url' => '/storage/catalogs/guia-instalacion.pdf',
                'active' => true,
                'order' => 6,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}