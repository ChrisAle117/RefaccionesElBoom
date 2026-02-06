# Guía de Mejores Prácticas - RefaccionesElBoom

## 🎯 Propósito
Este documento establece las mejores prácticas y estándares de código para el proyecto RefaccionesElBoom.

---

## 📐 Estructura de Código

### Controllers
- Mantener controladores delgados: lógica de negocio en Services o Models
- Usar Form Requests para validación
- Aplicar autorización con Policies: `$this->authorize('action', $model)`
- Retornar respuestas consistentes

```php
// ✅ Bueno
public function store(StoreProductRequest $request)
{
    $this->authorize('create', Product::class);
    $product = Product::create($request->validated());
    return redirect()->route('admin.products')->with('success', 'Producto creado');
}

// ❌ Evitar
public function store(Request $request)
{
    if (!auth()->user()->isAdmin()) abort(403);
    $product = new Product();
    $product->name = $request->name; // validación inline
    // ... lógica compleja aquí
}
```

### Models
- Definir `$fillable` o `$guarded` explícitamente
- Usar `$casts` para conversión de tipos
- Documentar relaciones con PHPDoc
- Scope queries complejos en métodos scope

```php
// ✅ Bueno
class Product extends Model
{
    protected $fillable = ['name', 'code', 'price'];
    
    protected $casts = [
        'price' => 'float',
        'active' => 'boolean',
    ];
    
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }
}
```

### Form Requests
- Crear FormRequest para cada operación (store, update)
- Incluir autorización en `authorize()`
- Mensajes de error en español
- Reglas de validación claras y documentadas

```php
class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isAdmin();
    }
    
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:products',
        ];
    }
}
```

---

## 🔐 Seguridad

### Autenticación y Autorización
1. **Siempre** usar Policies para autorización granular
2. **Nunca** confiar en input del usuario sin validación
3. **Verificar** propiedad de recursos (ej: usuario puede ver su propia orden)

```php
// ✅ Bueno
public function show(Order $order)
{
    $this->authorize('view', $order);
    return view('orders.show', compact('order'));
}

// ❌ Evitar
public function show($id)
{
    $order = Order::find($id);
    return view('orders.show', compact('order')); // Sin verificación
}
```

### Validación de Datos
- Usar Form Requests, no validación inline
- Sanitizar inputs cuando sea necesario
- Validar archivos subidos (tipo, tamaño)

### API Endpoints
- Aplicar autenticación con Sanctum: `middleware('auth:sanctum')`
- Implementar rate limiting: `middleware('throttle:60,1')`
- Validar webhooks con firmas HMAC

---

## ⚡ Performance

### Consultas de Base de Datos

#### Prevenir N+1 Queries
```php
// ✅ Bueno - Eager loading
$orders = Order::with('items.product')->get();

// ❌ Evitar - N+1
$orders = Order::all();
foreach ($orders as $order) {
    foreach ($order->items as $item) {
        echo $item->product->name; // Query por cada producto
    }
}
```

#### Selección de Columnas
```php
// ✅ Bueno
Product::select(['id', 'name', 'price'])->get();

// ❌ Evitar
Product::all(); // Carga todas las columnas
```

#### Índices
- Agregar índices en columnas usadas en WHERE, ORDER BY, JOIN
- Considerar índices compuestos para consultas frecuentes

```php
// En migración
$table->index('code');
$table->index(['active', 'disponibility']);
```

### Caché
- Usar caché para datos costosos de calcular
- Establecer TTL apropiado
- **Importante:** El ProductObserver invalida caché automáticamente

```php
// ✅ Bueno
$products = Cache::remember('products.featured', 300, function () {
    return Product::active()->featured()->get();
});

// El caché se limpia automáticamente al crear/actualizar productos
```

---

## 🧪 Testing

### Tests Obligatorios
- Feature tests para flujos críticos (órdenes, pagos)
- Unit tests para lógica de negocio compleja
- Tests de integración para APIs externas (con mocks)

```php
// Ejemplo de Feature Test
public function test_admin_can_create_product()
{
    $admin = User::factory()->admin()->create();
    
    $response = $this->actingAs($admin)
        ->post('/admin/products', [
            'name' => 'Test Product',
            'code' => 'TEST-001',
            'price' => 100,
        ]);
    
    $response->assertRedirect();
    $this->assertDatabaseHas('products', ['code' => 'TEST-001']);
}
```

### Test Coverage Mínimo
- Controllers: 70%
- Models: 80%
- Policies: 90%
- Critical flows: 100%

---

## 📝 Documentación

### Código
- Documentar métodos públicos con PHPDoc
- Explicar lógica compleja con comentarios inline
- Mantener README.md actualizado

```php
/**
 * Sync local stock from warehouse for given product IDs
 * 
 * @param array $ids Array of product IDs to sync
 * @return int Number of products updated
 * @throws \Exception If warehouse connection fails
 */
public static function syncLocalStock(array $ids): int
{
    // Implementation
}
```

### API
- Documentar endpoints públicos (considerar Swagger/OpenAPI)
- Incluir ejemplos de request/response
- Documentar códigos de error

---

## 🚀 Deployment

### Pre-Deployment Checklist
- [ ] Tests passing: `php artisan test`
- [ ] Linter passing: `npm run lint`
- [ ] Migraciones revisadas
- [ ] Variables de entorno configuradas
- [ ] Caché limpiado: `php artisan cache:clear`
- [ ] Configuración optimizada: `php artisan config:cache`

### Post-Deployment
- [ ] Verificar logs: `tail -f storage/logs/laravel.log`
- [ ] Probar funcionalidades críticas
- [ ] Monitorear errores en Sentry (si está configurado)

---

## 🔧 Tools y Comandos Útiles

### Laravel
```bash
# Análisis de código
./vendor/bin/phpstan analyse

# Formatear código
./vendor/bin/pint

# Tests
php artisan test --parallel

# Base de datos
php artisan migrate --force
php artisan db:seed
```

### Frontend
```bash
# Linter
npm run lint

# Format
npm run format

# Build
npm run build
```

---

## 📊 Monitoreo

### Logs Importantes
```bash
# Errores generales
grep "ERROR" storage/logs/laravel.log

# Webhooks fallidos
grep "webhook" storage/logs/laravel.log | grep -i "fail"

# Queries lentas (si está habilitado)
grep "slow query" storage/logs/laravel.log
```

### Métricas a Vigilar
- Tiempo de respuesta de endpoints (< 200ms ideal)
- Tasa de error (< 1%)
- Uso de caché (hit rate > 80%)
- Queue jobs fallidos (< 5%)

---

## 🤝 Contribuciones

### Pull Request Guidelines
1. Crear branch desde `develop`: `git checkout -b feature/nombre-feature`
2. Commits descriptivos en español
3. Tests para nueva funcionalidad
4. Actualizar documentación relevante
5. Code review de al menos 1 persona

### Naming Conventions
- Branches: `feature/`, `bugfix/`, `hotfix/`
- Commits: Imperativo, ej: "Agrega validación de stock"
- Variables: camelCase en PHP, snake_case en BD
- Métodos: verbo + sustantivo, ej: `getActiveProducts()`

---

## ❓ Preguntas Frecuentes

### ¿Cómo agrego un nuevo índice?
```bash
php artisan make:migration add_index_to_table
# Editar migración
php artisan migrate
```

### ¿Cómo limpio el caché manualmente?
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### ¿Cómo depuro queries lentas?
```php
// En AppServiceProvider
DB::listen(function ($query) {
    if ($query->time > 100) {
        Log::warning('Slow query', [
            'sql' => $query->sql,
            'time' => $query->time,
        ]);
    }
});
```

---

**Última actualización:** 2026-02-06  
**Mantenido por:** Equipo de Desarrollo RefaccionesElBoom
