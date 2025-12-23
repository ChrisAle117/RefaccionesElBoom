<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Address;
use App\Models\User;

class AddressSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();

        if ($users->isEmpty()) {
            return;
        }

        foreach ($users as $user) {
            Address::create([
                'user_id' => $user->id,
                'calle' => 'Av. Insurgentes Sur 123',
                'colonia' => 'Roma Norte',
                'numero_exterior' => '123',
                'numero_interior' => '4B',
                'codigo_postal' => '06700',
                'ciudad' => 'Ciudad de México',
                'estado' => 'CDMX',
                'telefono' => '5512345678',
                'referencia' => 'Frente al parque',
            ]);

            Address::create([
                'user_id' => $user->id,
                'calle' => 'Paseo de la Reforma 456',
                'colonia' => 'Juárez',
                'numero_exterior' => '456',
                'numero_interior' => null,
                'codigo_postal' => '06600',
                'ciudad' => 'Ciudad de México',
                'estado' => 'CDMX',
                'telefono' => '5587654321',
                'referencia' => 'Edificio alto de cristal',
            ]);
        }
    }
}
