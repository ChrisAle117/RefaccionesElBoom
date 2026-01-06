# Documentación Técnica Completa - RefaccionesElBoom

**Sistema de E-Commerce para Venta de Refacciones Automotrices**

---

## Tabla de Contenidos

1. [Descripción General del Proyecto](#1-descripción-general-del-proyecto)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Instalación y Configuración](#3-instalación-y-configuración)
4. [Estructura del Proyecto](#4-estructura-del-proyecto)
5. [Base de Datos](#5-base-de-datos)
6. [API y Endpoints](#6-api-y-endpoints)
7. [Integraciones Externas](#7-integraciones-externas)
8. [Características Principales](#8-características-principales)
9. [Guía para Desarrolladores](#9-guía-para-desarrolladores)
10. [Despliegue en Producción](#10-despliegue-en-producción)
11. [Seguridad](#11-seguridad)
12. [Mantenimiento y Monitoreo](#12-mantenimiento-y-monitoreo)
13. [Solución de Problemas](#13-solución-de-problemas)

---

## 1. Descripción General del Proyecto

RefaccionesElBoom es un sistema completo de e-commerce desarrollado específicamente para la venta de refacciones automotrices. El sistema integra gestión de inventario, procesamiento de pagos, envíos automatizados, generación de facturas y un panel de administración completo.

### 1.1 Stack Tecnológico

#### Backend
- **Laravel 12**: Framework PHP para el backend
- **PHP 8.2+**: Lenguaje de programación
- **Inertia.js 2.0**: Bridge entre Laravel y React (SSR)
- **Eloquent ORM**: Gestión de base de datos
- **SQLite/MySQL**: Base de datos (SQLite para desarrollo, MySQL para producción)
- **Laravel Pint**: Formateo de código PHP (PSR-12)
- **Pest**: Framework de testing

#### Frontend
- **React 19**: Biblioteca de UI
- **TypeScript 5.7**: Superset tipado de JavaScript
- **Vite 6.0**: Herramienta de build y desarrollo
- **TailwindCSS 4.0**: Framework de CSS utility-first
- **Radix UI**: Componentes accesibles sin estilos
- **Framer Motion**: Animaciones
- **Lucide React**: Iconos

#### Integraciones de Terceros
- **Openpay**: Procesamiento de pagos con tarjeta
- **DHL Express**: Cotización y creación de guías de envío
- **Ultramsg**: Notificaciones por WhatsApp
- **PHPMailer**: Envío de correos electrónicos

### 1.2 Requisitos del Sistema

**Mínimos:**
- PHP 8.2 o superior
- Composer 2.x
- Node.js 20.x LTS
- npm 10.x
- MySQL 8.0+ o SQLite
- 4 GB RAM
- 20 GB de espacio en disco

---

## 2. Arquitectura del Sistema

### 2.1 Visión General

El proyecto utiliza una arquitectura monolítica modular con separación clara de responsabilidades:

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
│  ┌────────────────┐  ┌─────────────────────────────────┐   │
│  │   Database     │  │      File Storage               │   │
│  │ MySQL/SQLite   │  │  - Images  - PDFs  - Audio      │   │
│  └────────────────┘  └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                  INTEGRACIONES EXTERNAS                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Openpay  │  │   DHL    │  │ WhatsApp │  │   SMTP   │   │
│  │ Payments │  │ Shipping │  │  Ultramsg│  │PHPMailer │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Patrones de Diseño

#### MVC (Model-View-Controller)
- **Model**: Clases Eloquent en `app/Models/`
- **View**: Componentes React en `resources/js/pages/`
- **Controller**: Controladores Laravel en `app/Http/Controllers/`

#### Service Layer Pattern
Para lógica de negocio compleja que no pertenece a Controllers o Models:

```php
class DhlShipmentService
{
    public function createShipment(Order $order): array
    {
        $payload = $this->buildShipmentPayload($order);
        $response = $this->callDhlApi($payload);
        return $this->processResponse($response);
    }
}
```

#### Repository Pattern (Implícito con Eloquent)
Eloquent ORM abstrae la lógica de acceso a datos.

### 2.3 Flujo de Request/Response

```
1. Usuario interactúa con UI (React)
   ↓
2. Inertia Link/Form
   ↓
3. HTTP Request a Laravel
   ↓
4. Middleware Stack (Auth, CSRF, etc.)
   ↓
5. Controller recibe request
   ↓
6. Controller llama Services (opcional)
   ↓
7. Services/Models interactúan con Database
   ↓
8. Controller retorna Inertia Response
   ↓
9. Inertia serializa datos a JSON
   ↓
10. React renderiza component con props
```

---

## 3. Instalación y Configuración

### 3.1 Instalación Rápida (5 minutos)

#### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/ChrisAle117/RefaccionesElBoom.git
cd RefaccionesElBoom
```

#### Paso 2: Instalar Dependencias
```bash
# Dependencias PHP
composer install

# Dependencias JavaScript
npm install
```

#### Paso 3: Configurar Entorno
```bash
# Copiar archivo de configuración
cp .env.example .env

# Generar clave de aplicación
php artisan key:generate

# Crear base de datos SQLite (desarrollo)
touch database/database.sqlite
```

#### Paso 4: Configurar Base de Datos

Editar `.env`:
```env
DB_CONNECTION=sqlite
```

#### Paso 5: Ejecutar Migraciones
```bash
php artisan migrate
```

#### Paso 6: Crear Enlace para Storage
```bash
php artisan storage:link
```

#### Paso 7: Iniciar Servidor
```bash
composer dev
```

Este comando inicia automáticamente:
- 🌐 Servidor Laravel (http://localhost:8000)
- 📦 Queue worker
- ⚡ Vite dev server

### 3.2 Configuración Detallada

#### Variables de Entorno Principales

```env
# Aplicación
APP_NAME="RefaccionesElBoom"
APP_ENV=local
APP_KEY=base64:generada_automaticamente
APP_DEBUG=true
APP_URL=http://localhost

# Base de Datos (Desarrollo)
DB_CONNECTION=sqlite

# Base de Datos (Producción)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=refacciones_elboom
DB_USERNAME=usuario
DB_PASSWORD=contraseña

# Openpay
OPENPAY_MERCHANT_ID=tu_merchant_id
OPENPAY_PRIVATE_KEY=tu_private_key
OPENPAY_PUBLIC_KEY=tu_public_key
OPENPAY_SANDBOX=true

# DHL Express
DHL_API_USERNAME=tu_username
DHL_API_PASSWORD=tu_password
DHL_ACCOUNT_NUMBER=tu_cuenta
DHL_BASE_URL=https://express.api.dhl.com/mydhlapi/test
DHL_ORIGIN_POSTAL_CODE=codigo_postal
DHL_ORIGIN_CITY=ciudad
DHL_ORIGIN_PROVINCE=estado
DHL_ORIGIN_COUNTRY=MX

# WhatsApp
ULTRAMSG_TOKEN=tu_token
ULTRAMSG_INSTANCE_ID=tu_instance_id
WHATSAPP_FROM=numero_origen
WHATSAPP_TO=numero_destino

# Email
MAIL_MAILER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=tu_correo@gmail.com
SMTP_PASSWORD=tu_password
SMTP_ENCRYPTION=tls
```

#### Crear Usuario Administrador

```bash
php artisan tinker
```

En la consola:
```php
$user = new App\Models\User();
$user->name = 'Administrador';
$user->email = 'admin@ejemplo.com';
$user->password = bcrypt('password');
$user->role = 'admin';
$user->email_verified_at = now();
$user->save();
exit
```

---

## 4. Estructura del Proyecto

```
RefaccionesElBoom/
├── app/
│   ├── Console/              # Comandos Artisan
│   ├── Http/
│   │   ├── Controllers/      # Controladores
│   │   │   ├── Admin/        # Panel de administración
│   │   │   ├── Api/          # Endpoints API
│   │   │   └── Auth/         # Autenticación
│   │   └── Middleware/       # Middlewares personalizados
│   ├── Jobs/                 # Jobs de cola
│   ├── Models/               # Modelos Eloquent
│   ├── Providers/            # Service Providers
│   └── Services/             # Servicios de negocio
│       ├── DhlRateService.php
│       ├── DhlShipmentService.php
│       ├── DHLPickupService.php
│       └── Mail/
├── bootstrap/                # Inicialización
├── config/                   # Configuración
├── database/
│   ├── factories/            # Factories para testing
│   ├── migrations/           # Migraciones
│   └── seeders/              # Seeders
├── public/                   # Archivos públicos
│   ├── build/                # Assets compilados
│   └── storage/              # Enlace a storage
├── resources/
│   ├── css/                  # Estilos globales
│   ├── js/                   # React/TypeScript
│   │   ├── components/       # Componentes reutilizables
│   │   ├── config/           # Configuraciones
│   │   ├── hooks/            # Custom hooks
│   │   ├── layouts/          # Layouts
│   │   ├── lib/              # Utilidades
│   │   ├── pages/            # Páginas
│   │   │   ├── Admin/        # Páginas admin
│   │   │   └── auth/         # Autenticación
│   │   ├── types/            # Tipos TypeScript
│   │   ├── app.tsx           # App raíz
│   │   └── ssr.tsx           # SSR config
│   └── views/                # Vistas Blade (mínimas)
├── routes/
│   ├── api.php               # Rutas API
│   ├── auth.php              # Rutas auth
│   ├── settings.php          # Configuración
│   └── web.php               # Rutas principales
├── storage/
│   ├── app/                  # Archivos de aplicación
│   ├── framework/            # Framework cache
│   └── logs/                 # Logs
├── tests/                    # Tests
│   ├── Feature/
│   └── Unit/
├── .env.example              # Variables de entorno ejemplo
├── composer.json             # Dependencias PHP
├── package.json              # Dependencias JS
├── tsconfig.json             # Config TypeScript
├── tailwind.config.js        # Config Tailwind
├── vite.config.ts            # Config Vite
├── phpunit.xml               # Config PHPUnit/Pest
└── Dockerfile                # Docker config
```

---

## 5. Base de Datos

### 5.1 Diagrama de Relaciones

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

### 5.2 Modelos Principales

#### User (Usuario)
```php
- id
- name
- email
- password
- email_verified_at
- role (enum: 'user', 'admin')
- timestamps
```

**Relaciones:**
- `hasMany` ShoppingCart, Order, Address, PaymentProof

#### Product (Producto)
```php
- id
- name
- description
- price (decimal)
- image (JSON array)
- stock
- reserved_stock
- active (boolean)
- type
- marca
- modelo
- numero_piezas
- presentacion
- weight, length, width, height (dimensiones)
- audio_path (para bocinas)
- color_variants (JSON)
- timestamps
```

**Métodos Importantes:**
```php
public function availableStock(): int
{
    return $this->stock - $this->reserved_stock;
}

public function scopeActive($query)
{
    return $query->where('active', true);
}
```

#### Order (Orden/Pedido)
```php
- id
- user_id
- total (decimal)
- status (enum: pending, processing, completed, cancelled, rejected)
- payment_method (enum: openpay, manual)
- shipping_* (campos de envío)
- dhl_tracking_number
- dhl_label_url
- invoice_* (campos de facturación)
- timestamps
```

**Estados:**
- `pending`: Pendiente de pago
- `processing`: En preparación
- `completed`: Completada
- `cancelled`: Cancelada por usuario
- `rejected`: Rechazada por admin

#### OrderItem (Artículo de Orden)
```php
- id
- order_id
- product_id
- quantity
- price (precio al momento de compra)
- timestamps
```

#### ShoppingCart y CartItem
```php
# ShoppingCart
- id
- user_id
- timestamps

# CartItem
- id
- cart_id
- product_id
- quantity
- timestamps
```

#### Address (Dirección)
```php
- id
- user_id
- name
- phone
- email
- address
- city
- estado
- postal_code
- country
- is_default (boolean)
- timestamps
```

#### Payment (Pago)
```php
- id
- order_id
- payment_id (ID de Openpay)
- amount
- status
- payment_method
- metadata (JSON)
- timestamps
```

#### PaymentProof (Comprobante)
```php
- id
- order_id
- user_id
- file_path
- status (enum: pending, approved, rejected)
- admin_notes
- reviewed_by
- reviewed_at
- timestamps
```

#### Vacancy (Vacante)
```php
- id
- title
- description
- requirements
- benefits
- location
- salary_range
- employment_type
- status (enum: active, inactive)
- expires_at
- timestamps
```

#### Catalog (Catálogo)
```php
- id
- name
- description
- file_path
- image_path
- is_active
- order
- timestamps
```

### 5.3 Sistema de Stock

El sistema implementa un mecanismo de **stock reservado** para evitar sobreventas:

```
Stock Disponible = Stock Físico - Stock Reservado

Ejemplo:
- Stock Físico: 10 unidades en almacén
- Stock Reservado: 3 unidades en órdenes pending/processing
- Stock Disponible: 7 unidades que pueden venderse
```

**Flujo:**
1. Usuario agrega al carrito: No reserva stock
2. Usuario crea orden: Stock se reserva inmediatamente
3. Orden completada/cancelada: Stock reservado se libera

---

## 6. API y Endpoints

### 6.1 Autenticación

La autenticación se maneja mediante sesiones de Laravel. 

**Headers Requeridos:**
- `X-CSRF-TOKEN`: Token CSRF (incluido automáticamente por Inertia)
- `X-Inertia`: true
- `X-Inertia-Version`: Hash de assets

### 6.2 Rutas Públicas

#### Página Principal
```http
GET /
GET /{tab}
```
**Tabs:** productos, nosotros, sucursales, vacantes, catalogos, deshuesadero, datos, terminos, soporte

#### API Pública
```http
GET /api/vacancies              # Lista vacantes
GET /api/vacancies/{id}         # Detalle vacante
GET /api/catalogs               # Catálogos públicos
GET /postal-info/{cp}           # Info código postal
```

### 6.3 Rutas Autenticadas

#### Carrito de Compras
```http
GET  /cart                      # Ver carrito
POST /cart/add                  # Agregar producto
  Body: { product_id, quantity }
PUT  /cart/update               # Actualizar cantidad
  Body: { cart_item_id, quantity }
DELETE /cart/remove/{id}        # Eliminar del carrito
```

#### Órdenes
```http
POST /orders                    # Crear orden
  Body: { payment_method, shipping_address_id, shipping_cost, invoice }
GET  /orders                    # Lista órdenes usuario
GET  /orders/{id}               # Detalle orden
POST /orders/{id}/cancel        # Cancelar orden
```

#### Direcciones
```http
GET  /addresses                 # Listar direcciones
POST /addresses                 # Guardar dirección
  Body: { name, phone, email, address, city, estado, postal_code, country, is_default }
```

#### Comprobantes de Pago
```http
POST /orders/{orderId}/payment-proof    # Subir comprobante
  Body: multipart/form-data con file
```

#### Openpay (Pagos)
```http
POST /api/create-openpay-checkout       # Crear checkout
  Body: { order_id }
  Response: { checkout_url, checkout_id }
```

#### DHL (Envíos)
```http
GET  /dhl/rate                          # Cotizar envío
  Query: postal_code, weight, length, width, height
POST /api/dhl/rate-cart                 # Cotizar para carrito
  Body: { postal_code, cart_items }
```

### 6.4 Rutas de Administración

**Prefix:** `/admin` (requiere autenticación + rol admin)

#### Productos
```http
GET    /admin/products                  # Lista productos
POST   /admin/products                  # Crear producto
PUT    /admin/products/{id}             # Actualizar producto
DELETE /admin/products/{id}             # Eliminar producto
PUT    /admin/products/{id}/toggle-status   # Activar/desactivar
POST   /admin/products/sync-stock       # Sincronizar inventario
POST   /admin/products/{id}/audio       # Subir audio (bocinas)
GET    /admin/products/incidences       # Ver incidencias stock
```

#### Órdenes
```http
GET  /admin/orders                      # Lista todas órdenes
GET  /admin/orders/{id}                 # Detalle orden
PUT  /admin/orders/{id}/status          # Actualizar estado
  Body: { status }
GET  /admin/orders/{id}/shipping-pdf    # PDF orden surtido
GET  /admin/orders/{id}/label-pdf       # Etiqueta DHL
GET  /admin/payments/sync               # Sincronizar pagos Openpay
```

#### Comprobantes de Pago
```http
GET  /admin/payment-proofs              # Lista comprobantes pendientes
POST /admin/payment-proofs/{id}/approve # Aprobar
  Body: { notes }
POST /admin/payment-proofs/{id}/reject  # Rechazar
  Body: { notes }
```

#### Vacantes
```http
GET    /admin/vacancies                 # Lista vacantes
POST   /admin/vacancies                 # Crear vacante
PUT    /admin/vacancies/{id}            # Actualizar vacante
DELETE /admin/vacancies/{id}            # Eliminar vacante
PUT    /admin/vacancies/{id}/toggle-status  # Activar/desactivar
POST   /admin/vacancies/{id}/duplicate  # Duplicar vacante
```

#### Catálogos
```http
GET    /admin/catalogs                  # Lista catálogos
POST   /admin/catalogs                  # Crear catálogo
PUT    /admin/catalogs/{id}             # Actualizar catálogo
DELETE /admin/catalogs/{id}             # Eliminar catálogo
PUT    /admin/catalogs/{id}/toggle-active   # Activar/desactivar
POST   /admin/catalogs/reorder          # Reordenar
  Body: { order: [id1, id2, id3] }
```

### 6.5 Webhooks

```http
POST /openpay/webhook                   # Webhook Openpay
  (Sin CSRF verification)
```

**Eventos Soportados:**
- `charge.succeeded`: Pago exitoso
- `charge.failed`: Pago fallido
- `charge.cancelled`: Pago cancelado
- `charge.refunded`: Pago reembolsado

### 6.6 Códigos de Estado HTTP

- `200 OK`: Request exitoso
- `201 Created`: Recurso creado
- `302 Found`: Redirect (común con Inertia)
- `400 Bad Request`: Datos inválidos
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: Sin permisos
- `404 Not Found`: Recurso no encontrado
- `422 Unprocessable Entity`: Validación fallida
- `500 Internal Server Error`: Error del servidor

---

## 7. Integraciones Externas

### 7.1 Openpay - Procesamiento de Pagos

**Funcionalidades:**
- Creación de sesiones de checkout
- Procesamiento de pagos con tarjeta
- Soporte para 3D Secure
- Webhooks para actualización de estados
- Reembolsos y cancelaciones

**Archivos:**
- `app/Http/Controllers/OpenpayCheckoutController.php`
- `app/Http/Controllers/OpenpayWebhookController.php`
- `app/Models/Payment.php`

**Flujo:**
```
1. Usuario completa carrito → Selecciona pago con tarjeta
2. Sistema crea checkout en Openpay
3. Usuario redirigido a Openpay → Ingresa datos tarjeta
4. Openpay procesa pago → Notifica vía webhook
5. Sistema actualiza orden según resultado
```

**Configuración:**
```env
OPENPAY_MERCHANT_ID=mxxxxxxx
OPENPAY_PRIVATE_KEY=pk_xxxxx
OPENPAY_PUBLIC_KEY=pk_xxxxx
OPENPAY_SANDBOX=false  # true para pruebas
```

### 7.2 DHL Express - Envíos y Logística

**Funcionalidades:**
- Cotización de tarifas
- Creación de guías de envío
- Generación de etiquetas PDF
- Programación de recolecciones
- Seguimiento de envíos

**Archivos:**
- `app/Services/DhlRateService.php`
- `app/Services/DhlShipmentService.php`
- `app/Services/DHLPickupService.php`
- `app/Http/Controllers/Api/ShippingRateController.php`

**Flujo:**
```
1. Usuario ingresa dirección de entrega
2. Sistema cotiza con DHL (peso + dimensiones)
3. Usuario confirma orden con costo de envío
4. Admin genera guía DHL desde panel
5. Sistema programa recolección automática
6. DHL recoge paquete → Tracking activo
```

**Configuración:**
```env
DHL_API_USERNAME=usuario
DHL_API_PASSWORD=password
DHL_ACCOUNT_NUMBER=123456789
DHL_BASE_URL=https://express.api.dhl.com/mydhlapi
DHL_ORIGIN_POSTAL_CODE=01000
DHL_ORIGIN_CITY=Ciudad de México
DHL_ORIGIN_PROVINCE=CDMX
DHL_ORIGIN_COUNTRY=MX
DHL_ORIGIN_ADDRESS_LINE1=Calle Principal 123
DHL_PICKUP_TIME=10:00
```

### 7.3 Ultramsg - Notificaciones WhatsApp

**Uso:**
- Notificaciones de nuevas órdenes
- Confirmación de pagos
- Actualizaciones de envío
- Alertas administrativas

**Configuración:**
```env
ULTRAMSG_TOKEN=tu_token_aqui
ULTRAMSG_INSTANCE_ID=instance123
WHATSAPP_FROM=521234567890
WHATSAPP_TO=521234567890
```

### 7.4 PHPMailer - Correo Electrónico

**Uso:**
- Confirmación de órdenes
- Notificaciones de cambio de estado
- Recuperación de contraseña
- Facturas electrónicas
- Comunicación con clientes

**Archivos:**
- `app/Services/Mail/PhpMailService.php`

**Configuración:**
```env
MAIL_MAILER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=correo@dominio.com
SMTP_PASSWORD=password_aplicacion
SMTP_ENCRYPTION=tls
MAIL_FROM_ADDRESS=correo@dominio.com
MAIL_FROM_NAME="RefaccionesElBoom"
```

---

## 8. Características Principales

### 8.1 Para Usuarios Finales

#### Catálogo de Productos
- Navegación por tipos de productos
- Búsqueda y filtrado avanzado
- Vista detallada con múltiples imágenes
- Información de stock en tiempo real
- Variantes de color
- Audio de demostración para bocinas

#### Carrito de Compras
- Carrito persistente (guardado en BD)
- Actualización de cantidades
- Validación de stock disponible
- Cálculo automático de subtotales
- Estimación de envío con DHL

#### Proceso de Checkout
- **Métodos de pago:**
  - Pago en línea con Openpay (tarjetas)
  - Transferencia/depósito bancario manual
- Guardado de direcciones de envío
- Cotización automática de envío
- Facturación electrónica opcional

#### Gestión de Órdenes
- Historial completo de órdenes
- Seguimiento de estado en tiempo real
- Tracking de envío DHL
- Descarga de facturas PDF
- Subida de comprobantes de pago
- Cancelación de órdenes (cuando aplique)

### 8.2 Para Administradores

#### Gestión de Productos
- CRUD completo de productos
- Carga múltiple de imágenes
- Gestión de variantes de color
- Control de inventario y stock reservado
- Activación/desactivación de productos
- Sincronización con BD de almacén externa
- Reportes de productos sin stock
- Detección de incidencias (sobreventas)
- Gestión de audio para bocinas

#### Gestión de Órdenes
- Vista de todas las órdenes del sistema
- Filtrado por estado y fechas
- Actualización de estados
- Aprobación/rechazo de comprobantes
- Generación de órdenes de surtido (PDF)
- Sincronización de estados de pago

#### Logística y Envíos
- Creación automática de guías DHL
- Descarga de etiquetas de envío
- Programación de recolecciones
- Vista de pickups programados
- Tracking automático

#### Gestión de Contenido
- Publicación de vacantes de empleo
- Subida y gestión de catálogos PDF
- Configuración de familias de productos
- Ordenamiento de tipos de productos

#### Reportes y Estadísticas
- Reporte de productos sin stock
- Incidencias de inventario
- Conteo de órdenes por estado
- Seguimiento de pagos pendientes

### 8.3 Flujos de Trabajo Principales

#### Flujo de Compra del Cliente
```
1. Cliente navega catálogo
2. Agrega productos al carrito
3. Procede a checkout
4. Ingresa dirección de envío
5. Sistema cotiza envío con DHL
6. Selecciona método de pago:
   a) Openpay → Redirige → Pago → Webhook actualiza
   b) Manual → Genera orden → Sube comprobante → Admin aprueba
```

#### Flujo de Procesamiento de Orden
```
1. Orden creada (status: pending)
2. Pago confirmado → Stock reservado → Status: processing
3. Admin genera orden de surtido (PDF)
4. Almacén prepara paquete
5. Admin crea guía DHL → Etiqueta PDF → Pickup programado
6. DHL recoge paquete → Tracking activo
7. Paquete entregado → Status: completed
```

#### Flujo de Sincronización de Inventario
```
1. Admin ejecuta "Sincronizar Stock"
2. Sistema consulta BD de almacén
3. Actualiza stock de productos
4. Detecta incidencias (stock reservado > físico)
5. Admin revisa incidencias → Contacta clientes si necesario
```

---

## 9. Guía para Desarrolladores

### 9.1 Convenciones de Código

#### PHP/Laravel

**Formateo:**
```bash
./vendor/bin/pint              # Formatear código
./vendor/bin/pint --test       # Verificar sin aplicar
```

**Nombres:**
```php
// Clases: PascalCase
class ProductController extends Controller {}

// Métodos: camelCase
public function createOrder() {}

// Variables: camelCase
$orderTotal = 100;

// Columnas BD: snake_case
$order->shipping_address;

// Constantes: UPPER_SNAKE_CASE
const MAX_UPLOAD_SIZE = 5000000;
```

**Ejemplo de Controlador:**
```php
class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::query()
            ->when($request->search, fn($q, $search) => 
                $q->where('name', 'like', "%{$search}%")
            )
            ->active()
            ->paginate(20);

        return Inertia::render('Products/Index', [
            'products' => $products,
            'filters' => $request->only(['search']),
        ]);
    }
}
```

**Ejemplo de Modelo:**
```php
class Order extends Model
{
    protected $fillable = ['user_id', 'total', 'status'];
    
    protected $casts = [
        'total' => 'decimal:2',
        'created_at' => 'datetime',
    ];
    
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
    
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['pending', 'processing']);
    }
    
    public function canBeCancelled(): bool
    {
        return $this->status === 'pending';
    }
}
```

#### TypeScript/React

**Formateo:**
```bash
npm run format              # Formatear con Prettier
npm run lint                # ESLint
npm run types               # Verificar tipos
```

**Nombres:**
```typescript
// Componentes: PascalCase
const ProductCard = () => {}

// Funciones: camelCase
const calculateTotal = () => {}

// Variables: camelCase
const orderTotal = 100;

// Constantes: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 5000000;

// Tipos: PascalCase
interface Product {}
type OrderStatus = 'pending' | 'processing';
```

**Ejemplo de Componente:**
```tsx
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
    router.post('/cart/add', 
      { product_id: product.id, quantity: 1 },
      {
        onSuccess: () => onAddToCart?.(product.id),
        onFinish: () => setIsLoading(false),
      }
    );
  };

  return (
    <div className="rounded-lg border p-4">
      <img src={product.image[0]} alt={product.name} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <Button onClick={handleAddToCart} disabled={isLoading}>
        {isLoading ? 'Agregando...' : 'Agregar al carrito'}
      </Button>
    </div>
  );
}
```

### 9.2 Testing

**Ejecutar Tests:**
```bash
php artisan test                    # Todos los tests
php artisan test --filter=ProductTest   # Test específico
./vendor/bin/pest                   # Con Pest directo
```

**Ejemplo de Test:**
```php
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
```

### 9.3 Comandos Útiles

```bash
# Crear modelo con migración, factory, seeder y controller
php artisan make:model Product -mfsc

# Crear controlador resource
php artisan make:controller ProductController --resource

# Crear service
php artisan make:service DhlShipmentService

# Listar rutas
php artisan route:list

# Limpiar cachés
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Optimizar para producción
php artisan config:cache
php artisan route:cache
php artisan optimize

# Tinker (REPL)
php artisan tinker

# Ver logs en tiempo real
php artisan pail
```

### 9.4 Flujo de Trabajo Git

**Crear Feature:**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/nueva-funcionalidad
# Hacer cambios
git add .
git commit -m "feat: agregar funcionalidad X"
git push origin feature/nueva-funcionalidad
# Crear Pull Request
```

**Convenciones de Commits:**
```bash
feat: nueva funcionalidad
fix: corrección de bug
refactor: refactorización
docs: documentación
style: formateo
test: agregar tests
chore: mantenimiento
```

---

## 10. Despliegue en Producción

### 10.1 Requisitos del Servidor

**Hardware Mínimo:**
- CPU: 2 cores
- RAM: 4 GB
- Disco: 20 GB SSD
- Ancho de banda: 100 Mbps

**Software:**
- Ubuntu 22.04 LTS (recomendado)
- PHP 8.2+
- Node.js 20.x
- Composer 2.x
- MySQL 8.0+
- Nginx
- Supervisor

### 10.2 Instalación en VPS

#### 1. Preparar Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar PHP 8.2
sudo add-apt-repository ppa:ondrej/php
sudo apt update
sudo apt install -y php8.2 php8.2-fpm php8.2-cli php8.2-mysql \
    php8.2-zip php8.2-gd php8.2-mbstring php8.2-curl \
    php8.2-xml php8.2-bcmath php8.2-sqlite3 php8.2-intl

# Instalar Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Instalar Nginx
sudo apt install -y nginx

# Instalar Supervisor
sudo apt install -y supervisor
```

#### 2. Configurar Base de Datos

```bash
sudo mysql
```

```sql
CREATE DATABASE refacciones_elboom CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'refacciones_user'@'localhost' IDENTIFIED BY 'password_seguro';
GRANT ALL PRIVILEGES ON refacciones_elboom.* TO 'refacciones_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 3. Clonar y Configurar Proyecto

```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/ChrisAle117/RefaccionesElBoom.git refacciones
cd refacciones

# Permisos
sudo chown -R www-data:www-data /var/www/refacciones
sudo chmod -R 755 /var/www/refacciones
sudo chmod -R 775 /var/www/refacciones/storage
sudo chmod -R 775 /var/www/refacciones/bootstrap/cache

# Instalar dependencias
composer install --no-dev --optimize-autoloader
npm ci --no-fund --no-audit

# Configurar .env
cp .env.example .env
nano .env  # Editar configuración

# Generar key y migrar
php artisan key:generate
php artisan migrate --force
php artisan storage:link

# Compilar assets
npm run build

# Optimizar
php artisan config:cache
php artisan route:cache
php artisan optimize
```

#### 4. Configurar Nginx

Crear `/etc/nginx/sites-available/refacciones`:

```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;
    root /var/www/refacciones/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;
    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    client_max_body_size 20M;
}
```

Habilitar sitio:
```bash
sudo ln -s /etc/nginx/sites-available/refacciones /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Configurar SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```

#### 6. Configurar Supervisor

Crear `/etc/supervisor/conf.d/refacciones-worker.conf`:

```ini
[program:refacciones-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/refacciones/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/refacciones/storage/logs/worker.log
stopwaitsecs=3600
```

Iniciar:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start refacciones-worker:*
```

#### 7. Configurar Cron

```bash
sudo crontab -e -u www-data
```

Agregar:
```
* * * * * cd /var/www/refacciones && php artisan schedule:run >> /dev/null 2>&1
```

### 10.3 Despliegue con Docker

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - APP_ENV=production
      - APP_DEBUG=false
      - APP_KEY=${APP_KEY}
      - DB_CONNECTION=mysql
      - DB_HOST=db
      - DB_DATABASE=refacciones
      - DB_USERNAME=root
      - DB_PASSWORD=${DB_PASSWORD}
    depends_on:
      - db
    volumes:
      - ./storage:/var/www/html/storage
    restart: unless-stopped

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: refacciones
    volumes:
      - db_data:/var/lib/mysql
    restart: unless-stopped

  worker:
    build: .
    command: php artisan queue:work --sleep=3 --tries=3
    environment:
      - DB_CONNECTION=mysql
      - DB_HOST=db
      - DB_DATABASE=refacciones
      - DB_USERNAME=root
      - DB_PASSWORD=${DB_PASSWORD}
    depends_on:
      - db
    volumes:
      - ./storage:/var/www/html/storage
    restart: unless-stopped

volumes:
  db_data:
```

**Comandos:**
```bash
docker-compose build
docker-compose run --rm app php artisan migrate --force
docker-compose up -d
```

### 10.4 Proceso de Actualización

```bash
cd /var/www/refacciones

# 1. Modo mantenimiento
php artisan down

# 2. Backup BD
mysqldump -u refacciones_user -p refacciones_elboom > backup.sql

# 3. Pull cambios
git pull origin main

# 4. Actualizar dependencias
composer install --no-dev --optimize-autoloader
npm ci --no-fund --no-audit

# 5. Migrar
php artisan migrate --force

# 6. Compilar
npm run build

# 7. Limpiar cachés
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan optimize

# 8. Reiniciar workers
sudo supervisorctl restart refacciones-worker:*

# 9. Quitar mantenimiento
php artisan up
```

---

## 11. Seguridad

### 11.1 Medidas Implementadas

#### Autenticación
- Passwords hasheados con Bcrypt (12 rounds)
- Verificación de email obligatoria
- Sistema de recuperación de contraseña

#### Autorización
- Middleware para verificación de roles
- Protección de rutas administrativas
- Validación de permisos en controladores

#### Protección CSRF
- Token CSRF en todos los formularios
- Validación automática por Laravel
- Excepciones para webhooks

#### Validación de Datos
- Validación de entrada en todos los endpoints
- Sanitización de datos antes de guardar
- Type-safety con TypeScript

#### SQL Injection
- Uso de Eloquent ORM
- Prepared statements automáticos
- Sin concatenación directa de SQL

#### XSS (Cross-Site Scripting)
- Escape automático de datos en React
- Sanitización de HTML cuando necesario
- Content Security Policy headers

#### Gestión de Archivos
- Validación de tipos
- Límites de tamaño
- Almacenamiento seguro en storage privado
- Verificación de permisos antes de descargas

### 11.2 Checklist de Seguridad

- [ ] `APP_DEBUG=false` en producción
- [ ] `APP_ENV=production`
- [ ] Generar nuevo `APP_KEY` único
- [ ] Usar HTTPS/SSL obligatorio
- [ ] Configurar firewall
- [ ] Deshabilitar listado de directorios
- [ ] Permisos correctos (755/644)
- [ ] Mantener actualizadas dependencias
- [ ] Cambiar credenciales predeterminadas
- [ ] Implementar backups automáticos
- [ ] Rate limiting configurado
- [ ] Monitoreo de logs
- [ ] Rotación de logs
- [ ] Secrets en variables de entorno
- [ ] CORS configurado

---

## 12. Mantenimiento y Monitoreo

### 12.1 Logs a Monitorear

```bash
# Laravel
tail -f /var/www/refacciones/storage/logs/laravel.log

# Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# PHP-FPM
tail -f /var/log/php8.2-fpm.log

# Workers
tail -f /var/www/refacciones/storage/logs/worker.log

# MySQL
tail -f /var/log/mysql/error.log
```

### 12.2 Comandos de Monitoreo

```bash
# Ver uso de recursos
htop

# Estado de servicios
sudo systemctl status nginx
sudo systemctl status php8.2-fpm
sudo systemctl status mysql
sudo supervisorctl status

# Espacio en disco
df -h

# Tamaño de storage
du -sh /var/www/refacciones/storage/*
```

### 12.3 Backups Automatizados

**Script de Backup** (`/usr/local/bin/backup-refacciones.sh`):

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/refacciones"
APP_DIR="/var/www/refacciones"

mkdir -p $BACKUP_DIR

# Backup BD
mysqldump -u refacciones_user -p'password' refacciones_elboom > \
    $BACKUP_DIR/db_$DATE.sql

# Backup storage
tar -czf $BACKUP_DIR/storage_$DATE.tar.gz $APP_DIR/storage/app

# Eliminar backups antiguos (más de 7 días)
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completado: $DATE"
```

**Configurar Cron:**
```bash
sudo crontab -e
```

Agregar:
```
0 2 * * * /usr/local/bin/backup-refacciones.sh >> /var/log/backups.log 2>&1
```

---

## 13. Solución de Problemas

### 13.1 Problemas Comunes

#### "Class not found"
```bash
composer dump-autoload
```

#### Assets no se cargan
```bash
npm run build
php artisan optimize:clear
```

#### Migrations fallan
```bash
php artisan migrate:fresh  # CUIDADO: Borra toda la BD
```

#### Permisos en storage
```bash
chmod -R 775 storage bootstrap/cache
```

#### Inertia version mismatch
```bash
php artisan optimize:clear
# Limpiar caché del navegador
```

#### Puerto 8000 en uso
```bash
php artisan serve --port=8001
```

### 13.2 Comandos de Diagnóstico

```bash
# Ver información del sistema
php artisan about

# Verificar configuración
php artisan config:show

# Ver todas las rutas
php artisan route:list

# Verificar conexión BD
php artisan tinker
>>> DB::connection()->getPdo();

# Ver versión de dependencias
composer show
npm list --depth=0
```

### 13.3 Contacto y Soporte

**Repositorio:** https://github.com/ChrisAle117/RefaccionesElBoom

**Desarrollador:** ChrisAle117

**Issues:** https://github.com/ChrisAle117/RefaccionesElBoom/issues

---

## Apéndice A: Comandos Útiles Rápidos

```bash
# DESARROLLO
composer dev                    # Iniciar todo (servidor + vite + queue)
php artisan serve              # Solo servidor
npm run dev                    # Solo Vite
php artisan queue:listen       # Solo queue worker
php artisan pail               # Ver logs en tiempo real

# TESTING
php artisan test               # Ejecutar tests
php artisan test --filter=TestName  # Test específico
./vendor/bin/pest              # Tests con Pest

# LINTING Y FORMATEO
./vendor/bin/pint              # Formatear PHP
npm run lint                   # ESLint
npm run format                 # Prettier
npm run types                  # Verificar tipos TS

# BASE DE DATOS
php artisan migrate            # Ejecutar migraciones
php artisan migrate:rollback   # Revertir última migración
php artisan migrate:fresh      # Resetear BD
php artisan db:seed            # Ejecutar seeders
php artisan tinker             # REPL de Laravel

# CACHÉ
php artisan cache:clear        # Limpiar caché
php artisan config:clear       # Limpiar config
php artisan route:clear        # Limpiar rutas
php artisan view:clear         # Limpiar vistas
php artisan optimize:clear     # Limpiar todo

# OPTIMIZACIÓN (PRODUCCIÓN)
php artisan config:cache       # Cachear config
php artisan route:cache        # Cachear rutas
php artisan optimize           # Optimizar todo
npm run build                  # Compilar assets

# GENERADORES
php artisan make:model Product -mfsc    # Modelo completo
php artisan make:controller ProductController --resource
php artisan make:service DhlService
php artisan make:middleware AdminMiddleware
php artisan make:request StoreProductRequest
php artisan make:job SendOrderConfirmation

# INFORMACIÓN
php artisan route:list         # Listar rutas
php artisan about              # Info del sistema
composer show                  # Dependencias PHP
npm list                       # Dependencias JS
```

---

## Apéndice B: Estructura de Archivos Clave

```
app/
├── Http/Controllers/
│   ├── ProductListingController.php      # Catálogo público
│   ├── ShoppingCartController.php        # Carrito
│   ├── OrderController.php               # Órdenes
│   ├── OpenpayCheckoutController.php     # Pagos Openpay
│   ├── OpenpayWebhookController.php      # Webhooks
│   ├── PaymentProofController.php        # Comprobantes
│   └── Admin/
│       ├── ProductController.php         # CRUD productos
│       ├── AdminVacancyController.php    # Vacantes
│       └── CatalogController.php         # Catálogos
├── Models/
│   ├── User.php                          # Usuario
│   ├── Product.php                       # Producto
│   ├── Order.php                         # Orden
│   ├── OrderItem.php                     # Item de orden
│   ├── ShoppingCart.php                  # Carrito
│   ├── CartItem.php                      # Item de carrito
│   ├── Address.php                       # Dirección
│   ├── Payment.php                       # Pago
│   ├── PaymentProof.php                  # Comprobante
│   ├── Vacancy.php                       # Vacante
│   └── Catalog.php                       # Catálogo
└── Services/
    ├── DhlRateService.php                # Cotizaciones DHL
    ├── DhlShipmentService.php            # Guías DHL
    ├── DHLPickupService.php              # Recolecciones DHL
    └── Mail/
        └── PhpMailService.php            # Envío de correos

resources/js/
├── pages/
│   ├── welcome.tsx                       # Home pública
│   ├── OrderSummary.tsx                  # Resumen de orden
│   └── Admin/
│       ├── dashboard.tsx                 # Dashboard admin
│       ├── ProductsAdmin.tsx             # Gestión productos
│       ├── OrdersAdmin.tsx               # Gestión órdenes
│       ├── PaymentProofs.tsx             # Comprobantes
│       └── VacanciesAdmin.tsx            # Gestión vacantes
├── components/
│   └── ui/                               # Componentes Radix UI
└── types/
    └── index.d.ts                        # Tipos TypeScript

routes/
├── web.php                               # Rutas principales
├── auth.php                              # Rutas autenticación
└── settings.php                          # Configuración

database/migrations/
├── 0001_01_01_000000_create_users_table.php
├── 2025_04_01_052223_create_products_table.php
├── 2025_04_03_143658_create_shopping_carts_table.php
├── 2025_04_22_155848_create_orders_table.php
├── 2025_05_24_160626_create_vacancies_table.php
└── ...
```

---

## Apéndice C: Glosario de Términos

- **Inertia.js**: Framework que permite crear SPAs usando routing server-side
- **Eloquent**: ORM de Laravel para interactuar con la base de datos
- **Middleware**: Filtros que procesan requests HTTP antes de llegar al controlador
- **Migration**: Archivos que definen cambios en la estructura de la BD
- **Seeder**: Archivos que pueblan la BD con datos de ejemplo
- **Factory**: Clases que generan datos de prueba para modelos
- **Job**: Tarea que se ejecuta en segundo plano mediante colas
- **Service**: Clase que encapsula lógica de negocio compleja
- **Scope**: Método de modelo que encapsula queries comunes
- **Cast**: Conversión automática de tipos de datos en modelos
- **SSR**: Server-Side Rendering (renderizado en el servidor)
- **SPA**: Single Page Application (aplicación de página única)
- **CRUD**: Create, Read, Update, Delete
- **API**: Application Programming Interface
- **REST**: Representational State Transfer
- **JWT**: JSON Web Token
- **CSRF**: Cross-Site Request Forgery
- **XSS**: Cross-Site Scripting
- **ORM**: Object-Relational Mapping
- **MVC**: Model-View-Controller

---

**Fecha de creación:** 6 de Enero de 2026  
**Versión:** 1.0.0  
**Autor:** GitHub Copilot Agent  
**Repositorio:** https://github.com/ChrisAle117/RefaccionesElBoom

---

**FIN DE LA DOCUMENTACIÓN**
