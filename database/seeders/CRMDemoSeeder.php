<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Address;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\UserNote;
use App\Models\Product;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class CRMDemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Asegurar que tenemos un admin para las notas
        $admin = User::where('role', 'admin')->first();
        if (!$admin) {
            $admin = User::create([
                'name' => 'Admin Demo',
                'email' => 'admin@demo.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]);
        }

        // Limpiar datos previos si es necesario (Opcional, ten cuidado)
        // DB::table('user_notes')->truncate();

        // 2. Clientes de prueba
        $clientsData = [
            ['name' => 'Juan Pérez', 'email' => 'juan.perez@test.com', 'estado' => 'Jalisco'],
            ['name' => 'María Rodríguez', 'email' => 'm.rodriguez@test.com', 'estado' => 'CDMX'],
            ['name' => 'Carlos Sánchez', 'email' => 'carlos.s@test.com', 'estado' => 'Nuevo León'],
            ['name' => 'Ana Martínez', 'email' => 'ana.mtz@test.com', 'estado' => 'Querétaro'],
            ['name' => 'Roberto López', 'email' => 'roberto.l@test.com', 'estado' => 'Puebla'],
        ];

        // 3. Obtener productos para las órdenes
        $products = Product::all();
        if ($products->isEmpty()) {
            Product::create([
                'name' => 'Faro LED Camión',
                'code' => 'DEMO-001',
                'price' => 850.50,
                'description' => 'Faro de alta potencia para tractocamión',
                'image' => 'demo_faro.jpg',
                'disponibility' => 150,
                'type' => 'Iluminación'
            ]);
            Product::create([
                'name' => 'Bocina de Aire Cromo',
                'code' => 'DEMO-002',
                'price' => 1200.00,
                'description' => 'Bocina clásica cromada doble tono',
                'image' => 'demo_bocina.jpg',
                'disponibility' => 45,
                'type' => 'Accesorios'
            ]);
            $products = Product::all();
        }

        foreach ($clientsData as $data) {
            // Evitar duplicados por email
            $user = User::where('email', $data['email'])->first();
            if (!$user) {
                $user = User::create([
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'password' => Hash::make('password'),
                    'role' => 'client',
                ]);
            }

            // Dirección
            $address = Address::where('user_id', $user->id)->first();
            if (!$address) {
                $address = Address::create([
                    'user_id' => $user->id,
                    'calle' => 'Avenida Principal 123',
                    'colonia' => 'Residencial',
                    'numero_exterior' => rand(100, 999),
                    'codigo_postal' => rand(44000, 68000),
                    'ciudad' => 'Metrópolis',
                    'estado' => $data['estado'],
                    'telefono' => '33' . rand(10000000, 99999999),
                ]);
            }

            // Crear un par de órdenes por cliente para que los reportes tengan datos
            if ($user->orders()->count() === 0) {
                for ($i = 0; $i < rand(1, 3); $i++) {
                    $order = Order::create([
                        'user_id' => $user->id,
                        'address_id' => $address->id_direccion,
                        'total_amount' => 0,
                        'status' => 'payment_verified',
                        'expires_at' => now()->addDays(7),
                        'created_at' => now()->subDays(rand(1, 60)),
                    ]);

                    $total = 0;
                    $itemCount = rand(1, 3);
                    for ($j = 0; $j < $itemCount; $j++) {
                        $prod = $products->random();
                        $qty = rand(1, 5);
                        $price = $prod->price;
                        
                        OrderItem::create([
                            'order_id' => $order->id_order,
                            'product_id' => $prod->id_product,
                            'quantity' => $qty,
                            'price' => $price,
                        ]);
                        $total += ($qty * $price);
                    }
                    $order->update(['total_amount' => $total]);
                }
            }

            // Una nota de ejemplo en el CRM
            if ($user->notes()->count() === 0) {
                UserNote::create([
                    'user_id' => $user->id,
                    'admin_id' => $admin->id,
                    'content' => "Cliente potencial. Solicitó información sobre precios de mayoreo para " . $products->random()->name . ".",
                    'created_at' => now()->subDays(rand(1, 10)),
                ]);
            }

            // 6. Carrito abandonado (para reportes de carrito)
            if ($user->cart) {
                $user->cart->items()->delete();
            } else {
                $cart = \App\Models\ShoppingCart::create(['user_id' => $user->id]);
            }
            
            $cart = $user->cart ?: \App\Models\ShoppingCart::where('user_id', $user->id)->first();
            for ($k = 0; $k < rand(1, 4); $k++) {
                \App\Models\CartItem::create([
                    'shopping_cart_id' => $cart->id_shopping_cart,
                    'id_product' => $products->random()->id_product,
                    'quantity' => rand(1, 3)
                ]);
            }
        }
    }
}
