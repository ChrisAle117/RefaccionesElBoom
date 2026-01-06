# API y Endpoints - RefaccionesElBoom

## 📡 Visión General

RefaccionesElBoom utiliza **Inertia.js** como puente entre Laravel y React, lo que significa que la mayoría de las interacciones no son requests API REST tradicionales, sino que usan el patrón de Inertia que combina server-side rendering con client-side routing.

Sin embargo, existen algunos endpoints API específicos para funcionalidades que requieren llamadas AJAX tradicionales.

## 🔐 Autenticación

La autenticación se maneja mediante sesiones de Laravel. No se utiliza autenticación basada en tokens para la aplicación principal.

**Headers Requeridos:**
- `X-CSRF-TOKEN`: Token CSRF de Laravel (incluido automáticamente por Inertia)
- `X-Inertia`: true (para requests de Inertia)
- `X-Inertia-Version`: Hash de assets (para invalidación de caché)

## 🛣️ Endpoints por Módulo

### 👤 Autenticación (Auth Routes)

Definidas en: `routes/auth.php`

#### Registro de Usuario
```http
POST /register
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Respuesta (302 Redirect):**
```http
Location: /dashboard
```

#### Login
```http
POST /login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "password123",
  "remember": true
}
```

**Respuesta:**
```http
302 Found
Location: /dashboard
```

#### Logout
```http
POST /logout
```

**Respuesta:**
```http
302 Found
Location: /
```

#### Recuperación de Contraseña
```http
POST /forgot-password
Content-Type: application/json

{
  "email": "juan@example.com"
}
```

**Respuesta:**
```json
{
  "status": "We have emailed your password reset link!"
}
```

#### Reset de Contraseña
```http
POST /reset-password
Content-Type: application/json

{
  "token": "reset_token_here",
  "email": "juan@example.com",
  "password": "new_password",
  "password_confirmation": "new_password"
}
```

### 🏠 Rutas Públicas

#### Página Principal
```http
GET /
GET /{tab}
```

**Tabs disponibles:**
- `productos`
- `nosotros`
- `sucursales`
- `vacantes`
- `catalogos`
- `deshuesadero`
- `datos`
- `terminos`
- `soporte`

**Respuesta:** Renderiza página de Inertia con componente `welcome`

### 📦 Productos

#### Listar Productos (API Inertia)
```http
GET /dashboard
GET /dashboard/productos
```

**Query Parameters:**
- `search`: string - Búsqueda por nombre
- `type`: string - Filtro por tipo
- `marca`: string - Filtro por marca
- `page`: number - Página (paginación)

**Respuesta (Props de Inertia):**
```json
{
  "products": {
    "data": [
      {
        "id": 1,
        "name": "Bomba de Gasolina",
        "description": "Compatible con...",
        "price": 1500.00,
        "stock": 10,
        "active": true,
        "image": ["url1.jpg", "url2.jpg"],
        "type": "motor",
        "marca": "Bosch"
      }
    ],
    "current_page": 1,
    "last_page": 5,
    "per_page": 20,
    "total": 100
  }
}
```

### 🛒 Carrito de Compras

#### Ver Carrito
```http
GET /cart
```

**Respuesta (Inertia Props):**
```json
{
  "cart": {
    "items": [
      {
        "id": 1,
        "product": {
          "id": 1,
          "name": "Bomba de Gasolina",
          "price": 1500.00,
          "image": ["url.jpg"]
        },
        "quantity": 2,
        "subtotal": 3000.00
      }
    ],
    "total": 3000.00
  }
}
```

#### Agregar al Carrito
```http
POST /cart/add
Content-Type: application/json

{
  "product_id": 1,
  "quantity": 2
}
```

**Respuesta:**
```json
{
  "message": "Producto agregado al carrito",
  "cart_count": 3
}
```

**Códigos de Error:**
- `400`: Producto no disponible o stock insuficiente
- `404`: Producto no encontrado

#### Actualizar Cantidad
```http
PUT /cart/update
Content-Type: application/json

{
  "cart_item_id": 1,
  "quantity": 3
}
```

**Respuesta:**
```json
{
  "message": "Carrito actualizado",
  "item": {
    "id": 1,
    "quantity": 3,
    "subtotal": 4500.00
  }
}
```

#### Eliminar del Carrito
```http
DELETE /cart/remove/{cart_item_id}
```

**Respuesta:**
```json
{
  "message": "Producto eliminado del carrito"
}
```

### 📍 Direcciones

#### Listar Direcciones del Usuario
```http
GET /addresses
```

**Respuesta:**
```json
{
  "addresses": [
    {
      "id": 1,
      "name": "Juan Pérez",
      "phone": "5512345678",
      "email": "juan@example.com",
      "address": "Av. Principal 123",
      "city": "Ciudad de México",
      "estado": "CDMX",
      "postal_code": "01000",
      "country": "México",
      "is_default": true
    }
  ]
}
```

#### Guardar Dirección
```http
POST /addresses
Content-Type: application/json

{
  "name": "Juan Pérez",
  "phone": "5512345678",
  "email": "juan@example.com",
  "address": "Av. Principal 123",
  "city": "Ciudad de México",
  "estado": "CDMX",
  "postal_code": "01000",
  "country": "México",
  "is_default": true
}
```

**Respuesta:**
```json
{
  "message": "Dirección guardada exitosamente",
  "address": {
    "id": 2,
    "name": "Juan Pérez",
    // ... resto de campos
  }
}
```

#### Información de Código Postal
```http
GET /postal-info/{codigo_postal}
```

**Ejemplo:**
```http
GET /postal-info/01000
```

**Respuesta:**
```json
{
  "codigo_postal": "01000",
  "estado": "Ciudad de México",
  "ciudad": "Ciudad de México",
  "colonias": [
    "Colonia Centro",
    "Colonia Juárez"
  ]
}
```

### 📦 Órdenes

#### Crear Orden
```http
POST /orders
Content-Type: application/json

{
  "payment_method": "manual",
  "shipping_address_id": 1,
  "shipping_cost": 150.00,
  "invoice": {
    "required": true,
    "rfc": "XAXX010101000",
    "razon_social": "Empresa S.A. de C.V.",
    "email": "facturacion@empresa.com",
    "uso_cfdi": "G03"
  }
}
```

**Respuesta:**
```json
{
  "message": "Orden creada exitosamente",
  "order": {
    "id": 123,
    "total": 3150.00,
    "status": "pending",
    "payment_method": "manual",
    "created_at": "2026-01-06T10:00:00.000000Z"
  }
}
```

#### Listar Órdenes del Usuario
```http
GET /orders
```

**Query Parameters:**
- `status`: string - Filtro por estado
- `page`: number - Paginación

**Respuesta:**
```json
{
  "orders": {
    "data": [
      {
        "id": 123,
        "total": 3150.00,
        "status": "processing",
        "payment_method": "manual",
        "created_at": "2026-01-06T10:00:00.000000Z",
        "items_count": 3
      }
    ],
    "current_page": 1,
    "last_page": 2
  }
}
```

#### Ver Detalle de Orden
```http
GET /orders/{order_id}
```

**Respuesta (Inertia Props):**
```json
{
  "order": {
    "id": 123,
    "total": 3150.00,
    "status": "processing",
    "payment_method": "manual",
    "shipping_cost": 150.00,
    "dhl_tracking_number": "1234567890",
    "items": [
      {
        "id": 1,
        "product": {
          "name": "Bomba de Gasolina",
          "image": ["url.jpg"]
        },
        "quantity": 2,
        "price": 1500.00,
        "subtotal": 3000.00
      }
    ],
    "shipping_address": {
      "name": "Juan Pérez",
      "address": "Av. Principal 123",
      "city": "Ciudad de México",
      "estado": "CDMX",
      "postal_code": "01000"
    }
  }
}
```

#### Cancelar Orden
```http
POST /orders/{order_id}/cancel
```

**Respuesta:**
```json
{
  "message": "Orden cancelada exitosamente",
  "order": {
    "id": 123,
    "status": "cancelled"
  }
}
```

**Nota:** Solo se pueden cancelar órdenes con estado `pending`

### 💰 Comprobantes de Pago

#### Subir Comprobante
```http
POST /orders/{order_id}/payment-proof
Content-Type: multipart/form-data

file: [archivo_imagen.jpg]
```

**Respuesta:**
```json
{
  "message": "Comprobante subido exitosamente",
  "proof": {
    "id": 1,
    "order_id": 123,
    "status": "pending",
    "created_at": "2026-01-06T10:00:00.000000Z"
  }
}
```

**Validaciones:**
- Tipos permitidos: jpg, jpeg, png, pdf
- Tamaño máximo: 5MB
- Solo para órdenes con payment_method = 'manual'

### 💳 Openpay (Pagos con Tarjeta)

#### Crear Checkout de Openpay
```http
POST /api/create-openpay-checkout
Content-Type: application/json

{
  "order_id": 123
}
```

**Respuesta:**
```json
{
  "checkout_url": "https://sandbox-checkout.openpay.mx/...",
  "checkout_id": "xyz123"
}
```

El usuario es redirigido a la URL de Openpay para completar el pago.

#### Webhook de Openpay
```http
POST /openpay/webhook
Content-Type: application/json

{
  "type": "charge.succeeded",
  "transaction": {
    "id": "xyz123",
    "amount": 3150.00,
    "status": "completed",
    "order_id": "123"
  }
}
```

**Respuesta:**
```json
{
  "message": "Webhook processed successfully"
}
```

**Eventos Soportados:**
- `charge.succeeded`: Pago exitoso
- `charge.failed`: Pago fallido
- `charge.cancelled`: Pago cancelado
- `charge.refunded`: Pago reembolsado

### 🚚 Envíos (DHL)

#### Cotizar Envío
```http
GET /dhl/rate
```

**Query Parameters:**
- `postal_code`: string (required) - CP destino
- `weight`: number (required) - Peso en kg
- `length`: number - Largo en cm
- `width`: number - Ancho en cm
- `height`: number - Alto en cm

**Ejemplo:**
```http
GET /dhl/rate?postal_code=01000&weight=2.5&length=30&width=20&height=15
```

**Respuesta:**
```json
{
  "rate": {
    "total_price": 150.00,
    "currency": "MXN",
    "service_type": "EXPRESS",
    "delivery_date": "2026-01-10"
  }
}
```

#### Cotizar Envío para Carrito
```http
POST /api/dhl/rate-cart
Content-Type: application/json

{
  "postal_code": "01000",
  "cart_items": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ]
}
```

**Respuesta:**
```json
{
  "rate": {
    "total_price": 150.00,
    "total_weight": 2.5,
    "estimated_delivery": "2026-01-10"
  }
}
```

### 📰 Contenido Público

#### Vacantes (API)
```http
GET /api/vacancies
```

**Query Parameters:**
- `status`: string - 'active' o 'inactive'
- `department`: string - Filtro por departamento

**Respuesta:**
```json
{
  "vacancies": [
    {
      "id": 1,
      "title": "Vendedor de Refacciones",
      "description": "Descripción completa...",
      "requirements": "- Experiencia en ventas\n- Conocimiento en...",
      "benefits": "- Sueldo competitivo\n- Prestaciones...",
      "location": "Ciudad de México",
      "salary_range": "$8,000 - $12,000",
      "employment_type": "Tiempo completo",
      "department": "Ventas",
      "contact_email": "rh@refacciones.com",
      "status": "active",
      "expires_at": "2026-02-01T00:00:00.000000Z"
    }
  ]
}
```

#### Detalle de Vacante
```http
GET /api/vacancies/{vacancy_id}
```

**Respuesta:**
```json
{
  "vacancy": {
    "id": 1,
    "title": "Vendedor de Refacciones",
    // ... todos los campos
  }
}
```

#### Catálogos Públicos
```http
GET /api/catalogs
GET /catalogs
```

**Respuesta:**
```json
{
  "catalogs": [
    {
      "id": 1,
      "name": "Catálogo General 2026",
      "description": "Catálogo completo de productos",
      "file_url": "/storage/catalogs/general-2026.pdf",
      "image_url": "/storage/catalog-images/general-thumb.jpg",
      "is_active": true,
      "order": 1
    }
  ]
}
```

---

## 🔐 Panel de Administración

### Todas las rutas administrativas requieren:
- Autenticación (`auth` middleware)
- Email verificado (`verified` middleware)
- Rol de administrador (`AdminMiddleware`)

**Prefix:** `/admin`

### 📦 Gestión de Productos

#### Listar Productos (Admin)
```http
GET /admin/products
```

**Query Parameters:**
- `search`: string
- `type`: string
- `active`: boolean
- `stock_status`: string ('in_stock', 'low_stock', 'out_of_stock')
- `page`: number

#### Crear Producto
```http
POST /admin/products
Content-Type: multipart/form-data

{
  "name": "Bomba de Gasolina",
  "description": "Compatible con...",
  "price": 1500.00,
  "stock": 10,
  "type": "motor",
  "marca": "Bosch",
  "modelo": "ABC123",
  "numero_piezas": "0580454008",
  "presentacion": "1 pieza",
  "weight": 2.5,
  "length": 20,
  "width": 15,
  "height": 10,
  "images[]": [archivo1.jpg, archivo2.jpg],
  "active": true
}
```

#### Actualizar Producto
```http
PUT /admin/products/{id}
```

Mismo formato que crear producto.

#### Eliminar Producto
```http
DELETE /admin/products/{id}
```

#### Activar/Desactivar Producto
```http
PUT /admin/products/{id}/toggle-status
```

**Respuesta:**
```json
{
  "message": "Estado actualizado",
  "active": false
}
```

#### Sincronizar Stock con Almacén
```http
POST /admin/products/sync-stock
```

**Respuesta:**
```json
{
  "message": "Stock sincronizado",
  "updated_count": 150,
  "incidences": [
    {
      "product_id": 1,
      "name": "Producto X",
      "physical_stock": 5,
      "reserved_stock": 8,
      "difference": -3
    }
  ]
}
```

#### Ver Incidencias de Stock
```http
GET /admin/products/incidences
```

**Respuesta:**
```json
{
  "incidences": [
    {
      "product": {
        "id": 1,
        "name": "Bomba de Gasolina",
        "stock": 5,
        "reserved_stock": 8
      },
      "affected_orders": [
        {
          "id": 123,
          "user": "Juan Pérez",
          "status": "processing"
        }
      ]
    }
  ]
}
```

#### Subir Audio para Producto (Bocinas)
```http
POST /admin/products/{id}/audio
Content-Type: multipart/form-data

audio: [archivo.mp3]
```

**Validaciones:**
- Tipos permitidos: mp3, wav
- Tamaño máximo: 10MB

### 📋 Gestión de Órdenes (Admin)

#### Listar Todas las Órdenes
```http
GET /admin/orders
```

**Query Parameters:**
- `status`: string
- `payment_method`: string
- `search`: string (por usuario o ID)
- `date_from`: date
- `date_to`: date
- `page`: number

#### Ver Detalle de Orden (Admin)
```http
GET /admin/orders/{id}
```

Incluye información completa de usuario, productos, pagos, y tracking.

#### Actualizar Estado de Orden
```http
PUT /admin/orders/{id}/status
Content-Type: application/json

{
  "status": "processing"
}
```

**Estados válidos:**
- `pending`: Pendiente de pago
- `processing`: En preparación
- `completed`: Completada
- `cancelled`: Cancelada
- `rejected`: Rechazada

#### Descargar PDF de Orden de Surtido
```http
GET /admin/orders/{id}/shipping-pdf
```

**Respuesta:** PDF file download

#### Descargar Etiqueta DHL
```http
GET /admin/orders/{id}/label-pdf
```

**Respuesta:** PDF file download

**Nota:** Genera la guía en DHL si aún no existe.

#### Sincronizar Estados de Pago
```http
GET /admin/payments/sync
```

Consulta Openpay para actualizar estados de pagos pendientes.

**Respuesta:**
```json
{
  "message": "Sincronización completada",
  "updated_count": 5,
  "updated_orders": [123, 124, 125, 126, 127]
}
```

### 💵 Comprobantes de Pago (Admin)

#### Listar Comprobantes Pendientes
```http
GET /admin/payment-proofs
```

**Respuesta:**
```json
{
  "proofs": [
    {
      "id": 1,
      "order": {
        "id": 123,
        "total": 3150.00,
        "user": {
          "name": "Juan Pérez",
          "email": "juan@example.com"
        }
      },
      "file_url": "/storage/payment-proofs/proof-1.jpg",
      "status": "pending",
      "created_at": "2026-01-06T10:00:00.000000Z"
    }
  ]
}
```

#### Aprobar Comprobante
```http
POST /admin/payment-proofs/{proof_id}/approve
Content-Type: application/json

{
  "notes": "Comprobante verificado correctamente"
}
```

**Respuesta:**
```json
{
  "message": "Comprobante aprobado",
  "order_updated": true,
  "order_status": "processing"
}
```

#### Rechazar Comprobante
```http
POST /admin/payment-proofs/{proof_id}/reject
Content-Type: application/json

{
  "notes": "El comprobante no es legible"
}
```

### 👔 Gestión de Vacantes (Admin)

#### Crear Vacante
```http
POST /admin/vacancies
Content-Type: application/json

{
  "title": "Vendedor de Refacciones",
  "description": "Descripción completa...",
  "requirements": "Lista de requisitos",
  "benefits": "Lista de beneficios",
  "location": "Ciudad de México",
  "salary_range": "$8,000 - $12,000",
  "employment_type": "Tiempo completo",
  "department": "Ventas",
  "contact_email": "rh@refacciones.com",
  "contact_phone": "5512345678",
  "status": "active",
  "expires_at": "2026-02-01"
}
```

#### Actualizar Vacante
```http
PUT /admin/vacancies/{id}
```

#### Eliminar Vacante
```http
DELETE /admin/vacancies/{id}
```

#### Activar/Desactivar Vacante
```http
PUT /admin/vacancies/{id}/toggle-status
```

#### Duplicar Vacante
```http
POST /admin/vacancies/{id}/duplicate
```

### 📚 Gestión de Catálogos (Admin)

#### Crear Catálogo
```http
POST /admin/catalogs
Content-Type: multipart/form-data

{
  "name": "Catálogo General 2026",
  "description": "Descripción",
  "file": [archivo.pdf],
  "image": [portada.jpg],
  "is_active": true
}
```

#### Actualizar Catálogo
```http
PUT /admin/catalogs/{id}
```

#### Eliminar Catálogo
```http
DELETE /admin/catalogs/{id}
```

#### Activar/Desactivar Catálogo
```http
PUT /admin/catalogs/{id}/toggle-active
```

#### Reordenar Catálogos
```http
POST /admin/catalogs/reorder
Content-Type: application/json

{
  "order": [3, 1, 2, 4]
}
```

---

## 📊 Códigos de Estado HTTP

### Éxito
- `200 OK`: Request exitoso
- `201 Created`: Recurso creado
- `302 Found`: Redirect (común con Inertia)

### Error del Cliente
- `400 Bad Request`: Datos inválidos
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: No autorizado (falta permisos)
- `404 Not Found`: Recurso no encontrado
- `422 Unprocessable Entity`: Validación fallida

### Error del Servidor
- `500 Internal Server Error`: Error del servidor

## 🔄 Formato de Respuestas de Error

```json
{
  "message": "Los datos proporcionados son inválidos",
  "errors": {
    "email": [
      "El campo email es obligatorio"
    ],
    "password": [
      "La contraseña debe tener al menos 8 caracteres"
    ]
  }
}
```

## 📝 Rate Limiting

Laravel aplica rate limiting por defecto:

- **API Routes**: 60 requests por minuto por IP
- **Web Routes**: Ilimitado (considera implementar según necesidad)

Para APIs sensibles, considerar implementar throttling adicional:

```php
Route::middleware('throttle:10,1')->group(function () {
    // Máximo 10 requests por minuto
});
```

---

Para más información sobre la arquitectura del sistema, consultar [ARCHITECTURE.md](ARCHITECTURE.md).
