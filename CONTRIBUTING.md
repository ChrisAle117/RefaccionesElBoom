# Guía para Desarrolladores - RefaccionesElBoom

## 🎯 Introducción

Esta guía está diseñada para desarrolladores que trabajarán en el proyecto RefaccionesElBoom. Cubre las convenciones de código, flujos de trabajo, y mejores prácticas del proyecto.

## 🛠️ Configuración del Entorno de Desarrollo

### Requisitos

- PHP 8.2+
- Composer 2.x
- Node.js 20.x LTS
- npm 10.x
- SQLite (para desarrollo local)
- Git

### Primera Configuración

```bash
# 1. Clonar el repositorio
git clone https://github.com/ChrisAle117/RefaccionesElBoom.git
cd RefaccionesElBoom

# 2. Instalar dependencias PHP
composer install

# 3. Instalar dependencias JavaScript
npm install

# 4. Configurar variables de entorno
cp .env.example .env
php artisan key:generate

# 5. Crear base de datos SQLite
touch database/database.sqlite

# 6. Ejecutar migraciones
php artisan migrate

# 7. (Opcional) Seed de datos de prueba
php artisan db:seed

# 8. Crear enlace simbólico para storage
php artisan storage:link

# 9. Iniciar servidor de desarrollo
composer dev
```

El comando `composer dev` inicia:
- Servidor Laravel (http://localhost:8000)
- Queue worker
- Vite dev server (con HMR)

### Servidores Individuales (Alternativa)

Si prefieres iniciar los servicios por separado:

```bash
# Terminal 1: Laravel
php artisan serve

# Terminal 2: Vite (Frontend)
npm run dev

# Terminal 3: Queue Worker
php artisan queue:listen

# Terminal 4: Logs en tiempo real (opcional)
php artisan pail
```

## 📝 Convenciones de Código

### PHP/Laravel

#### Estilo de Código

El proyecto usa **Laravel Pint** para formateo automático basado en PSR-12.

```bash
# Formatear todo el código
./vendor/bin/pint

# Ver cambios sin aplicar
./vendor/bin/pint --test

# Formatear archivos específicos
./vendor/bin/pint app/Http/Controllers
```

#### Nombres y Estructura

**Clases:**
```php
// PascalCase para nombres de clases
class ProductController extends Controller {}
class DhlShipmentService {}
```

**Métodos:**
```php
// camelCase para métodos
public function createOrder() {}
public function getUserOrders() {}
```

**Variables:**
```php
// camelCase para variables en PHP
$orderTotal = 100;
$userName = 'Juan';

// snake_case para columnas de base de datos
$order->shipping_address;
$product->numero_piezas;
```

**Constantes:**
```php
// UPPER_SNAKE_CASE
const MAX_UPLOAD_SIZE = 5000000;
const DEFAULT_CURRENCY = 'MXN';
```

#### Controladores

**Estructura típica de un controlador:**

```php
<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of products.
     */
    public function index(Request $request)
    {
        $products = Product::query()
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->active()
            ->paginate(20);

        return Inertia::render('Products/Index', [
            'products' => $products,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created product.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
        ]);

        $product = Product::create($validated);

        return redirect()
            ->route('products.index')
            ->with('success', 'Producto creado exitosamente');
    }
}
```

**Mejores Prácticas:**
- Un método por acción (index, create, store, show, edit, update, destroy)
- Validación explícita con `$request->validate()`
- Usar Form Requests para validaciones complejas
- Delegar lógica de negocio compleja a Services
- Retornar respuestas Inertia para páginas

#### Modelos

**Ejemplo de modelo bien estructurado:**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'total',
        'status',
        'payment_method',
        'shipping_address',
        // ...
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'total' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'created_at' => 'datetime',
    ];

    /**
     * Get the user that owns the order.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the items for the order.
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Scope to filter active orders.
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['pending', 'processing']);
    }

    /**
     * Check if order can be cancelled.
     */
    public function canBeCancelled(): bool
    {
        return $this->status === 'pending';
    }
}
```

**Mejores Prácticas:**
- Definir `$fillable` o `$guarded`
- Usar `$casts` para tipos de datos
- Documentar relaciones con PHPDoc
- Usar Scopes para queries comunes
- Métodos helper para lógica del modelo

#### Services

**Cuando crear un Service:**
- Lógica de negocio compleja
- Interacción con APIs externas
- Operaciones que involucran múltiples modelos
- Lógica reutilizable entre controladores

**Ejemplo:**

```php
<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;

class OrderService
{
    /**
     * Create a new order from cart items.
     */
    public function createFromCart(User $user, array $cartItems, array $shippingData): Order
    {
        // Validar stock
        $this->validateStock($cartItems);

        // Calcular total
        $total = $this->calculateTotal($cartItems);

        // Crear orden
        $order = Order::create([
            'user_id' => $user->id,
            'total' => $total,
            'status' => 'pending',
            // ...
        ]);

        // Crear items
        foreach ($cartItems as $item) {
            $order->items()->create([
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'price' => $item['price'],
            ]);
        }

        // Reservar stock
        $this->reserveStock($order);

        return $order;
    }

    private function validateStock(array $items): void
    {
        foreach ($items as $item) {
            $product = Product::find($item['product_id']);
            if ($product->availableStock() < $item['quantity']) {
                throw new \Exception("Stock insuficiente para {$product->name}");
            }
        }
    }

    // ... más métodos
}
```

#### Validación

**Form Requests para validaciones complejas:**

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'payment_method' => 'required|in:openpay,manual',
            'shipping_address_id' => 'required|exists:addresses,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'El carrito está vacío',
            'items.*.quantity.min' => 'La cantidad debe ser al menos 1',
        ];
    }
}
```

**Uso en controlador:**
```php
public function store(StoreOrderRequest $request)
{
    // $request ya está validado
    $order = $this->orderService->create($request->validated());
}
```

### TypeScript/React

#### Estilo de Código

El proyecto usa **ESLint** y **Prettier** para formateo.

```bash
# Formatear código
npm run format

# Verificar formato
npm run format:check

# Lintear y auto-fix
npm run lint

# Verificar tipos
npm run types
```

#### Convenciones de Nomenclatura

```typescript
// PascalCase para componentes
const ProductCard = () => {}
const OrderSummary = () => {}

// camelCase para funciones
const calculateTotal = () => {}
const handleSubmit = () => {}

// camelCase para variables
const orderTotal = 100;
const isLoading = false;

// UPPER_SNAKE_CASE para constantes
const MAX_FILE_SIZE = 5000000;
const DEFAULT_PAGE_SIZE = 20;

// Tipos e Interfaces en PascalCase
interface Product {}
type OrderStatus = 'pending' | 'processing';
```

#### Componentes React

**Estructura de un componente:**

```tsx
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: number;
    image: string[];
  };
  onAddToCart?: (productId: number) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = () => {
    setIsLoading(true);
    
    router.post(
      '/cart/add',
      { product_id: product.id, quantity: 1 },
      {
        onSuccess: () => {
          onAddToCart?.(product.id);
        },
        onFinish: () => {
          setIsLoading(false);
        },
      }
    );
  };

  return (
    <div className="rounded-lg border p-4">
      <img
        src={product.image[0]}
        alt={product.name}
        className="h-48 w-full object-cover"
      />
      <h3 className="mt-2 text-lg font-semibold">{product.name}</h3>
      <p className="text-xl font-bold">${product.price}</p>
      <Button
        onClick={handleAddToCart}
        disabled={isLoading}
        className="mt-2 w-full"
      >
        {isLoading ? 'Agregando...' : 'Agregar al carrito'}
      </Button>
    </div>
  );
}
```

**Mejores Prácticas:**
- Componentes funcionales con hooks
- Props tipadas con TypeScript
- Usar Inertia router para navegación
- Desestructurar props en parámetros
- Nombres descriptivos para handlers (handle*)
- Separar lógica compleja en custom hooks

#### Custom Hooks

```typescript
// hooks/useCart.ts
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export function useCart() {
  const [itemCount, setItemCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const addItem = (productId: number, quantity: number = 1) => {
    setIsLoading(true);
    router.post(
      '/cart/add',
      { product_id: productId, quantity },
      {
        onSuccess: (page) => {
          setItemCount(page.props.cartCount as number);
        },
        onFinish: () => setIsLoading(false),
      }
    );
  };

  return {
    itemCount,
    isLoading,
    addItem,
  };
}
```

**Uso:**
```tsx
function ProductPage() {
  const { addItem, isLoading, itemCount } = useCart();
  
  return (
    <div>
      <Badge>{itemCount} items</Badge>
      <Button onClick={() => addItem(1)} disabled={isLoading}>
        Agregar
      </Button>
    </div>
  );
}
```

#### Tipos TypeScript

**Definir tipos en `types/index.d.ts`:**

```typescript
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string[];
  type: string;
  marca: string;
  modelo: string;
  active: boolean;
}

export interface Order {
  id: number;
  user_id: number;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  payment_method: 'openpay' | 'manual';
  items: OrderItem[];
  created_at: string;
}

export interface PageProps {
  auth: {
    user: User | null;
  };
  flash: {
    success?: string;
    error?: string;
  };
  errors: Record<string, string>;
}
```

## 🔄 Flujo de Trabajo Git

### Estrategia de Branching

```
main (producción)
  └── develop (desarrollo)
       ├── feature/nueva-funcionalidad
       ├── fix/correccion-bug
       └── hotfix/parche-urgente
```

### Crear una Nueva Feature

```bash
# 1. Actualizar develop
git checkout develop
git pull origin develop

# 2. Crear branch de feature
git checkout -b feature/nombre-descriptivo

# 3. Hacer cambios y commits
git add .
git commit -m "feat: agregar funcionalidad X"

# 4. Push del branch
git push origin feature/nombre-descriptivo

# 5. Crear Pull Request en GitHub
```

### Convenciones de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Nuevas funcionalidades
git commit -m "feat: agregar búsqueda de productos"
git commit -m "feat(admin): agregar panel de estadísticas"

# Corrección de bugs
git commit -m "fix: corregir cálculo de envío"
git commit -m "fix(cart): resolver problema de stock"

# Refactoring
git commit -m "refactor: simplificar lógica de checkout"

# Documentación
git commit -m "docs: actualizar guía de instalación"

# Estilos (formateo, sin cambios de código)
git commit -m "style: formatear con Prettier"

# Tests
git commit -m "test: agregar tests para OrderService"

# Chores (tareas de mantenimiento)
git commit -m "chore: actualizar dependencias"
```

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
php artisan test

# Test específico
php artisan test --filter=ProductTest

# Con cobertura
php artisan test --coverage

# Pest directo
./vendor/bin/pest
```

### Escribir Tests

**Test de Feature:**

```php
<?php

use App\Models\User;
use App\Models\Product;

it('allows authenticated users to add products to cart', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create(['stock' => 10]);

    actingAs($user)
        ->post('/cart/add', [
            'product_id' => $product->id,
            'quantity' => 2,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($user->cart->items)->toHaveCount(1);
    expect($user->cart->items->first()->quantity)->toBe(2);
});

it('prevents adding out of stock products', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create(['stock' => 0]);

    actingAs($user)
        ->post('/cart/add', [
            'product_id' => $product->id,
            'quantity' => 1,
        ])
        ->assertStatus(400)
        ->assertJson(['error' => 'Producto sin stock']);
});
```

**Test Unitario:**

```php
<?php

use App\Services\DhlRateService;

it('calculates shipping rate correctly', function () {
    $service = new DhlRateService();
    
    $rate = $service->calculateRate(
        postalCode: '01000',
        weight: 2.5,
        dimensions: [30, 20, 15]
    );
    
    expect($rate)->toBeNumeric();
    expect($rate)->toBeGreaterThan(0);
});
```

## 🐛 Debugging

### Laravel Debugbar (Desarrollo)

Instalar (si no está instalado):

```bash
composer require barryvdh/laravel-debugbar --dev
```

Muestra automáticamente:
- Queries ejecutadas
- Variables de sesión
- Rutas y controladores
- Tiempo de ejecución
- Uso de memoria

### Laravel Telescope (Opcional)

Para debugging avanzado:

```bash
composer require laravel/telescope --dev
php artisan telescope:install
php artisan migrate
```

Acceder en: `http://localhost:8000/telescope`

### Xdebug con VS Code

**1. Instalar Xdebug:**
```bash
sudo apt install php8.2-xdebug
```

**2. Configurar en `php.ini`:**
```ini
[xdebug]
xdebug.mode=debug
xdebug.start_with_request=yes
xdebug.client_port=9003
```

**3. Configurar VS Code (`.vscode/launch.json`):**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Listen for Xdebug",
      "type": "php",
      "request": "launch",
      "port": 9003,
      "pathMappings": {
        "/var/www/html": "${workspaceFolder}"
      }
    }
  ]
}
```

### React DevTools

Instalar extensión de navegador:
- [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

## 📚 Recursos Útiles

### Documentación

- **Laravel**: https://laravel.com/docs/12.x
- **Inertia.js**: https://inertiajs.com
- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs
- **TailwindCSS**: https://tailwindcss.com/docs
- **Radix UI**: https://www.radix-ui.com

### Paquetes Comunes Utilizados

- **@inertiajs/react**: Bridge Inertia-React
- **@radix-ui/react-***: Componentes UI accesibles
- **framer-motion**: Animaciones
- **lucide-react**: Iconos
- **date-fns**: Manejo de fechas
- **react-pdf**: Visualización de PDFs

### Comandos Artisan Útiles

```bash
# Crear modelo con todo
php artisan make:model Product -mfsc
# -m: migration, -f: factory, -s: seeder, -c: controller

# Crear controlador resource
php artisan make:controller ProductController --resource

# Crear middleware
php artisan make:middleware AdminMiddleware

# Crear service
php artisan make:service DhlShipmentService

# Crear form request
php artisan make:request StoreProductRequest

# Crear job
php artisan make:job SendOrderConfirmation

# Listar todas las rutas
php artisan route:list

# Tinker (REPL)
php artisan tinker
```

## 🔍 Solución de Problemas Comunes

### Problema: "Class not found"

```bash
composer dump-autoload
```

### Problema: Assets no se cargan

```bash
npm run build
php artisan optimize:clear
```

### Problema: Migrations fallan

```bash
php artisan migrate:fresh
# CUIDADO: Borra toda la base de datos
```

### Problema: Permisos en storage

```bash
chmod -R 775 storage bootstrap/cache
```

### Problema: Inertia version mismatch

```bash
# Limpiar caché del navegador
# O en el código:
php artisan optimize:clear
```

## 🎨 UI Components

El proyecto usa **shadcn/ui** (Radix UI + TailwindCSS).

**Agregar nuevo componente:**
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
```

**Uso:**
```tsx
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

<Button variant="default" size="lg">
  Guardar
</Button>
```

## 📊 Base de Datos

### Crear Nueva Migración

```bash
php artisan make:migration create_products_table
php artisan make:migration add_audio_path_to_products_table
```

**Estructura típica:**
```php
public function up()
{
    Schema::create('products', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->text('description')->nullable();
        $table->decimal('price', 10, 2);
        $table->integer('stock')->default(0);
        $table->boolean('active')->default(true);
        $table->timestamps();
        
        // Índices
        $table->index('active');
        $table->index(['active', 'stock']);
    });
}
```

### Seeders

```php
<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run()
    {
        Product::factory()->count(50)->create();
    }
}
```

**Ejecutar:**
```bash
php artisan db:seed --class=ProductSeeder
```

## 🚀 Performance Tips

### Backend

```php
// Eager loading para evitar N+1
Order::with(['items.product', 'user'])->get();

// Seleccionar solo columnas necesarias
Product::select(['id', 'name', 'price'])->get();

// Chunk para grandes datasets
Product::chunk(100, fn($products) => /* procesar */);

// Cache queries costosas
Cache::remember('products-active', 3600, fn() =>
    Product::active()->get()
);
```

### Frontend

```tsx
// Lazy loading de componentes
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'));

// Debounce para búsquedas
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback(
  (value) => {
    router.get('/products', { search: value });
  },
  500
);
```

---

**¿Preguntas?** Abre un issue en GitHub o contacta al equipo de desarrollo.
