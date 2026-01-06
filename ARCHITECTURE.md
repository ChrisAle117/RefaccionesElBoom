# Arquitectura del Sistema RefaccionesElBoom

## 📐 Visión General de la Arquitectura

RefaccionesElBoom implementa una arquitectura moderna de aplicación web full-stack con las siguientes características clave:

- **Patrón**: Arquitectura de Aplicación Monolítica Modular
- **Estilo**: Server-Side Rendering (SSR) con SPA híbrido mediante Inertia.js
- **Backend**: MVC con Service Layer
- **Frontend**: Component-Based Architecture con React
- **Base de Datos**: Relacional (MySQL/SQLite) con ORM Eloquent

## 🏛️ Capas de la Aplicación

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           React Components (TypeScript)                 │ │
│  │  - Pages (Inertia)  - Components  - Layouts            │ │
│  │  - Hooks            - Types       - Utils              │ │
│  └────────────────────────────────────────────────────────┘ │
│                           ↕                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   Inertia.js Bridge                     │ │
│  │           (Server-Side Rendering + Client)             │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   CAPA DE APLICACIÓN (LARAVEL)              │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    Controllers                          │ │
│  │  - ProductController    - OrderController              │ │
│  │  - ShoppingCartController  - PaymentProofController    │ │
│  │  - AdminControllers     - AuthControllers              │ │
│  └────────────────────────────────────────────────────────┘ │
│                           ↕                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   Service Layer                         │ │
│  │  - DhlRateService      - DhlShipmentService            │ │
│  │  - DHLPickupService    - PhpMailService                │ │
│  └────────────────────────────────────────────────────────┘ │
│                           ↕                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    Models (Eloquent)                    │ │
│  │  - User    - Product   - Order    - Payment            │ │
│  │  - Cart    - Address   - Vacancy  - Catalog            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   CAPA DE PERSISTENCIA                       │
│                                                              │
│  ┌────────────────┐  ┌─────────────────────────────────┐   │
│  │   Database     │  │      File Storage               │   │
│  │ MySQL/SQLite   │  │  - Images  - PDFs  - Audio      │   │
│  └────────────────┘  └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                  INTEGRACIONES EXTERNAS                      │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Openpay  │  │   DHL    │  │ WhatsApp │  │   SMTP   │   │
│  │ Payments │  │ Shipping │  │  Ultramsg│  │PHPMailer │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Datos

### Request/Response Flow con Inertia.js

```
1. Usuario interactúa con UI (React)
   ↓
2. Router de React (Inertia Link/Form)
   ↓
3. HTTP Request a Laravel
   ↓
4. Middleware Stack
   - Autenticación
   - CSRF Verification
   - Autorización
   ↓
5. Controller recibe request
   ↓
6. Controller llama a Services (si es necesario)
   ↓
7. Services consultan/modifican Models
   ↓
8. Models interactúan con Database
   ↓
9. Controller retorna Inertia Response
   ↓
10. Inertia serializa datos a JSON
    ↓
11. Frontend recibe JSON + component name
    ↓
12. React renderiza component con props
```

### Estado de la Aplicación

#### Backend State (Laravel)
- **Session**: Datos de usuario autenticado, carrito (ID), flash messages
- **Database**: Estado persistente de todos los modelos
- **Cache**: Resultados de queries costosas (si se implementa)
- **Queue**: Jobs pendientes de procesamiento

#### Frontend State (React)
- **Inertia Shared Data**: Usuario actual, flash messages, errores
- **Component State**: Estado local de componentes
- **Form State**: Datos de formularios en edición
- **URL State**: Parámetros de búsqueda y filtros

## 🏗️ Patrones de Diseño Utilizados

### 1. MVC (Model-View-Controller)

**Implementación en el proyecto:**
- **Model**: Clases Eloquent (`app/Models/`)
- **View**: Componentes React + Inertia (`resources/js/pages/`)
- **Controller**: Controladores Laravel (`app/Http/Controllers/`)

**Ejemplo:**
```php
// Controller
class ProductController extends Controller
{
    public function index()
    {
        $products = Product::active()->paginate(20);
        return Inertia::render('Products/Index', [
            'products' => $products
        ]);
    }
}
```

```tsx
// View (React)
export default function Index({ products }) {
  return (
    <div>
      {products.data.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### 2. Repository Pattern (Implícito con Eloquent)

Eloquent ORM actúa como una implementación del patrón Repository, abstrayendo la lógica de acceso a datos.

```php
// En lugar de queries SQL directas:
$products = Product::where('active', true)
    ->where('stock', '>', 0)
    ->orderBy('created_at', 'desc')
    ->get();
```

### 3. Service Layer Pattern

Para lógica de negocio compleja que no pertenece a Controllers o Models.

```php
// app/Services/DhlShipmentService.php
class DhlShipmentService
{
    public function createShipment(Order $order): array
    {
        // Lógica compleja de creación de envío
        $payload = $this->buildShipmentPayload($order);
        $response = $this->callDhlApi($payload);
        return $this->processResponse($response);
    }
}
```

**Uso en Controller:**
```php
public function generateLabel(Order $order, DhlShipmentService $dhlService)
{
    $shipment = $dhlService->createShipment($order);
    $order->update(['dhl_tracking_number' => $shipment['tracking']]);
}
```

### 4. Observer Pattern

Laravel permite el uso de Observers para reaccionar a eventos de modelos.

```php
// app/Observers/OrderObserver.php
class OrderObserver
{
    public function created(Order $order)
    {
        // Enviar notificación cuando se crea una orden
        Mail::to($order->user)->send(new OrderCreated($order));
    }
    
    public function updated(Order $order)
    {
        if ($order->wasChanged('status')) {
            // Notificar cambio de estado
        }
    }
}
```

### 5. Dependency Injection

Laravel implementa DI automáticamente a través de su Service Container.

```php
class OrderController extends Controller
{
    public function __construct(
        private DhlShipmentService $dhlService,
        private PaymentService $paymentService
    ) {}
    
    public function show(Order $order)
    {
        // Dependencias inyectadas automáticamente
    }
}
```

### 6. Middleware Pattern

Chain of Responsibility para procesar requests.

```php
Route::middleware(['auth', 'verified', AdminMiddleware::class])
    ->group(function () {
        // Rutas protegidas
    });
```

### 7. Factory Pattern

Para creación de objetos complejos en tests.

```php
// database/factories/ProductFactory.php
Product::factory()
    ->withImages()
    ->active()
    ->create();
```

## 🗃️ Diseño de Base de Datos

### Diagrama de Relaciones

```
┌──────────┐         ┌──────────────┐         ┌─────────────┐
│   User   │────────<│ ShoppingCart │>───────<│  CartItem   │
└──────────┘         └──────────────┘         └─────────────┘
     │                                               │
     │                                               │
     │                                               ▼
     │                                         ┌─────────┐
     │                                         │ Product │
     │                                         └─────────┘
     │                                               ▲
     │                                               │
     ▼                                               │
┌──────────┐         ┌──────────────┐               │
│ Address  │         │    Order     │───────────────┘
└──────────┘         └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  OrderItem   │
                     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   Payment    │
                     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ PaymentProof │
                     └──────────────┘
```

### Normalización

La base de datos sigue la **3ra Forma Normal (3NF)**:

1. **1NF**: Todos los atributos son atómicos
2. **2NF**: No hay dependencias parciales
3. **3NF**: No hay dependencias transitivas

**Ejemplo de normalización:**
- Los items del carrito están en tabla separada (`cart_items`)
- Las direcciones están en tabla separada (`addresses`)
- Los items de orden están separados de la orden (`order_items`)

### Índices Estratégicos

```php
// Índices definidos en migraciones
Schema::table('products', function (Blueprint $table) {
    $table->index('active');           // Filtro común
    $table->index('type');             // Categorización
    $table->index('stock');            // Verificación de disponibilidad
    $table->index(['active', 'stock']); // Compuesto para queries frecuentes
});

Schema::table('orders', function (Blueprint $table) {
    $table->index('user_id');          // Búsqueda por usuario
    $table->index('status');           // Filtro de estado
    $table->index('created_at');       // Ordenamiento temporal
});
```

### Estrategia de Stock

El sistema implementa un mecanismo de **stock reservado** para evitar sobreventas:

```
Stock Disponible = Stock Físico - Stock Reservado

Stock Físico:    Cantidad real en almacén
Stock Reservado: Suma de productos en órdenes pending/processing
Stock Disponible: Cantidad que puede venderse
```

**Flujo:**
1. Usuario agrega al carrito: No reserva stock (permite browning)
2. Usuario crea orden: Stock se reserva inmediatamente
3. Orden completada/cancelada: Stock reservado se libera

## 🔐 Arquitectura de Seguridad

### Capas de Seguridad

```
┌─────────────────────────────────────────────────────┐
│ 1. Edge Layer (Nginx/Apache + Cloudflare)          │
│    - Rate Limiting                                  │
│    - DDoS Protection                                │
│    - SSL/TLS Termination                            │
└─────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 2. Application Gateway (Laravel Middleware)         │
│    - CSRF Protection                                │
│    - Authentication Verification                    │
│    - Authorization Checks                           │
│    - Request Validation                             │
└─────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 3. Business Logic Layer (Controllers + Services)    │
│    - Input Sanitization                             │
│    - Business Rules Enforcement                     │
│    - Role-Based Access Control (RBAC)               │
└─────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 4. Data Access Layer (ORM)                          │
│    - SQL Injection Prevention (Prepared Statements) │
│    - Query Scope Isolation                          │
└─────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│ 5. Database Layer                                   │
│    - Encrypted Connections                          │
│    - Principle of Least Privilege                   │
└─────────────────────────────────────────────────────┘
```

### Autenticación y Autorización

**Middleware Stack para rutas protegidas:**
```php
Route::middleware(['auth', 'verified', AdminMiddleware::class])
```

1. **auth**: Verifica sesión activa
2. **verified**: Verifica email verificado
3. **AdminMiddleware**: Verifica rol de administrador

**Ejemplo de implementación:**
```php
class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!auth()->user() || auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }
        return $next($request);
    }
}
```

## 📦 Gestión de Dependencias

### Backend (Composer)

```json
{
  "require": {
    "laravel/framework": "^12.0",        // Core framework
    "inertiajs/inertia-laravel": "^2.0", // SSR bridge
    "openpay/sdk": "^3.1",               // Payments
    "barryvdh/laravel-dompdf": "^3.1",   // PDF generation
    "spatie/laravel-webhook-client": "^3.4" // Webhook handling
  }
}
```

### Frontend (NPM)

```json
{
  "dependencies": {
    "react": "^19.0.0",                 // UI library
    "@inertiajs/react": "^2.0.0",       // Inertia client
    "@radix-ui/react-*": "^1.x",        // UI components
    "framer-motion": "^12.23.12",       // Animations
    "lucide-react": "^0.475.0"          // Icons
  },
  "devDependencies": {
    "typescript": "^5.7.2",             // Type checking
    "vite": "^6.0",                     // Build tool
    "tailwindcss": "^4.0.16"            // Styling
  }
}
```

## 🚀 Pipeline de Build y Deploy

### Proceso de Build

```
1. Desarrollo Local
   ├─→ composer install
   ├─→ npm install
   ├─→ php artisan migrate
   └─→ composer dev (servidor + vite + queue)

2. Linting y Validación
   ├─→ ./vendor/bin/pint (PHP)
   ├─→ npm run lint (TypeScript)
   ├─→ npm run types (Type check)
   └─→ npm run format:check (Prettier)

3. Testing
   ├─→ php artisan test (Backend)
   └─→ (Frontend tests si existieran)

4. Build de Producción
   ├─→ npm run build
   │   ├─→ Vite compila TypeScript
   │   ├─→ TailwindCSS purge & minify
   │   ├─→ Tree-shaking
   │   └─→ Genera manifesto en public/build/
   ├─→ composer install --no-dev --optimize-autoloader
   └─→ php artisan optimize

5. Deploy
   ├─→ Docker build (opcional)
   └─→ Upload a servidor
       ├─→ php artisan migrate --force
       ├─→ php artisan config:cache
       ├─→ php artisan route:cache
       └─→ php artisan view:cache
```

## 📊 Performance y Optimización

### Estrategias de Caché

1. **Config Caching**
```bash
php artisan config:cache  # En producción
```

2. **Route Caching**
```bash
php artisan route:cache   # En producción
```

3. **View Caching**
```bash
php artisan view:cache    # Para Blade (mínimo uso)
```

4. **Query Optimization**
```php
// Eager Loading para evitar N+1
Order::with(['items.product', 'user', 'payments'])->get();

// Selección de columnas específicas
Product::select(['id', 'name', 'price', 'stock'])->get();
```

5. **Asset Optimization**
- Vite realiza code-splitting automático
- Lazy loading de componentes pesados
- Compresión gzip/brotli en servidor

### Database Optimization

```php
// Índices compuestos para queries comunes
Schema::table('products', function (Blueprint $table) {
    $table->index(['active', 'type', 'stock']);
});

// Paginación para grandes datasets
Product::active()->paginate(20);

// Queries chunk para procesamiento masivo
Product::chunk(100, function ($products) {
    foreach ($products as $product) {
        // Procesar
    }
});
```

## 🔄 Queue System (Trabajo Asíncrono)

Laravel implementa un sistema de colas para procesos largos:

```php
// app/Jobs/SendOrderConfirmation.php
class SendOrderConfirmation implements ShouldQueue
{
    public function __construct(
        private Order $order
    ) {}
    
    public function handle()
    {
        Mail::to($this->order->user)
            ->send(new OrderConfirmationMail($this->order));
    }
}

// Dispatch del job
SendOrderConfirmation::dispatch($order);
```

**Worker en producción:**
```bash
php artisan queue:work --tries=3 --timeout=90
```

## 📈 Escalabilidad

### Consideraciones para Crecimiento

1. **Horizontal Scaling**
   - Load balancer delante de múltiples instancias de Laravel
   - Sesiones en Redis/Database (no en archivos)
   - Storage compartido (S3, NFS)

2. **Database Scaling**
   - Read replicas para queries pesadas
   - Sharding por tipo de datos si es necesario
   - Connection pooling

3. **Caché Distribuido**
   - Redis/Memcached para sesiones y caché
   - CDN para assets estáticos

4. **Microservicios (Futuro)**
   - Payment Service independiente
   - Inventory Service independiente
   - Notification Service independiente

## 🛠️ Herramientas de Desarrollo

### IDE Recomendado

- **PHPStorm** con plugins de Laravel
- **VS Code** con extensiones:
  - Laravel Blade Snippets
  - Laravel Extra Intellisense
  - PHP Intelephense
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense

### Debug Tools

- **Laravel Telescope**: Monitoring y debugging (dev)
- **Laravel Debugbar**: Request info (dev)
- **React DevTools**: Component inspection
- **Xdebug**: PHP debugging

### Monitoring (Producción)

- **Laravel Pulse**: Application metrics
- **Sentry**: Error tracking
- **New Relic / DataDog**: APM
- **CloudWatch**: Logs y métricas (AWS)

---

Este documento describe la arquitectura técnica del sistema. Para información sobre instalación y uso, consultar [README.md](README.md).
