# RefaccionesElBoom - Sistema de E-Commerce

## 📋 Descripción del Proyecto

RefaccionesElBoom es un sistema completo de e-commerce desarrollado para la venta de refacciones automotrices. El sistema incluye gestión de inventario, procesamiento de pagos, envíos, generación de facturas y un panel de administración completo.

## 🏗️ Arquitectura del Sistema

El proyecto utiliza una arquitectura moderna basada en:

- **Backend**: Laravel 12 (PHP 8.2+)
- **Frontend**: React 19 con TypeScript
- **Framework de UI**: Inertia.js 2.0 (SPA sin API REST)
- **Estilos**: TailwindCSS 4.0 + Radix UI
- **Base de Datos**: SQLite (desarrollo) / MySQL (producción)
- **Gestión de Paquetes**: Composer (PHP) + npm (JavaScript)

### Stack Tecnológico Completo

#### Backend
- Laravel Framework 12
- PHP 8.2+
- Inertia.js para SSR
- Laravel Pint (Code Style)
- Pest (Testing)
- DomPDF (Generación de PDFs)
- Doctrine DBAL (Manipulación de BD)

#### Frontend
- React 19
- TypeScript 5.7
- Vite 6.0
- TailwindCSS 4.0
- Radix UI Components
- Framer Motion (Animaciones)
- Lucide Icons
- React Router DOM
- date-fns (Manejo de fechas)

#### Integraciones de Terceros
- **Openpay**: Procesamiento de pagos con tarjeta
- **DHL Express**: Cotización y creación de guías de envío
- **Ultramsg**: Notificaciones por WhatsApp
- **PHPMailer**: Envío de correos electrónicos

## 🚀 Instalación y Configuración

### Requisitos Previos

- PHP 8.2 o superior
- Composer 2.x
- Node.js 20.x o superior
- npm o yarn
- SQLite (desarrollo) o MySQL 8.0+ (producción)

### Instalación Paso a Paso

1. **Clonar el repositorio**
```bash
git clone https://github.com/ChrisAle117/RefaccionesElBoom.git
cd RefaccionesElBoom
```

2. **Instalar dependencias de PHP**
```bash
composer install
```

3. **Instalar dependencias de JavaScript**
```bash
npm install
```

4. **Configurar variables de entorno**
```bash
cp .env.example .env
php artisan key:generate
```

5. **Configurar la base de datos**

Editar el archivo `.env` con las credenciales de tu base de datos:

```env
# Para desarrollo (SQLite)
DB_CONNECTION=sqlite

# Para producción (MySQL)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=refacciones_elboom
DB_USERNAME=root
DB_PASSWORD=
```

6. **Ejecutar migraciones**
```bash
php artisan migrate
```

7. **Crear enlace simbólico para storage**
```bash
php artisan storage:link
```

8. **Compilar assets del frontend**

Para desarrollo:
```bash
npm run dev
```

Para producción:
```bash
npm run build
```

9. **Iniciar el servidor de desarrollo**

Laravel proporciona un comando que inicia todos los servicios necesarios:
```bash
composer dev
```

O iniciar servicios individualmente:
```bash
# Terminal 1: Servidor Laravel
php artisan serve

# Terminal 2: Compilador de assets
npm run dev

# Terminal 3: Queue worker (opcional)
php artisan queue:listen
```

### Configuración de Integraciones

#### Openpay (Pagos)
```env
OPENPAY_MERCHANT_ID=tu_merchant_id
OPENPAY_PRIVATE_KEY=tu_private_key
OPENPAY_PUBLIC_KEY=tu_public_key
OPENPAY_SANDBOX=true  # false para producción
```

#### DHL Express (Envíos)
```env
DHL_API_USERNAME=tu_username
DHL_API_PASSWORD=tu_password
DHL_ACCOUNT_NUMBER=tu_cuenta
DHL_BASE_URL=https://express.api.dhl.com/mydhlapi/test
DHL_ORIGIN_POSTAL_CODE=codigo_postal
DHL_ORIGIN_CITY=ciudad
DHL_ORIGIN_PROVINCE=estado
DHL_ORIGIN_COUNTRY=MX
DHL_ORIGIN_ADDRESS_LINE1=direccion
DHL_PICKUP_TIME=10:00
```

#### WhatsApp (Notificaciones)
```env
ULTRAMSG_TOKEN=tu_token
ULTRAMSG_INSTANCE_ID=tu_instance_id
WHATSAPP_FROM=numero_origen
WHATSAPP_TO=numero_destino
```

#### Correo Electrónico
```env
MAIL_MAILER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=tu_correo@gmail.com
SMTP_PASSWORD=tu_password
SMTP_ENCRYPTION=tls
MAIL_FROM_ADDRESS=tu_correo@gmail.com
MAIL_FROM_NAME="RefaccionesElBoom"
```

## 📁 Estructura del Proyecto

```
RefaccionesElBoom/
├── app/
│   ├── Console/          # Comandos de consola Artisan
│   ├── Http/
│   │   ├── Controllers/  # Controladores de la aplicación
│   │   │   ├── Admin/    # Controladores del panel de administración
│   │   │   ├── Api/      # Controladores de API
│   │   │   └── Auth/     # Controladores de autenticación
│   │   └── Middleware/   # Middlewares personalizados
│   ├── Jobs/             # Jobs de cola (trabajos en segundo plano)
│   ├── Models/           # Modelos Eloquent
│   ├── Providers/        # Service Providers
│   └── Services/         # Servicios de lógica de negocio
│       ├── DhlRateService.php
│       ├── DhlShipmentService.php
│       ├── DHLPickupService.php
│       └── Mail/
├── bootstrap/            # Archivos de inicialización de Laravel
├── config/               # Archivos de configuración
├── database/
│   ├── factories/        # Factories para testing
│   ├── migrations/       # Migraciones de base de datos
│   └── seeders/          # Seeders para datos iniciales
├── public/               # Archivos públicos (punto de entrada)
│   ├── build/            # Assets compilados
│   └── storage/          # Enlace simbólico a storage
├── resources/
│   ├── css/              # Estilos globales
│   ├── js/               # Código fuente de React/TypeScript
│   │   ├── components/   # Componentes React reutilizables
│   │   ├── config/       # Configuraciones del frontend
│   │   ├── hooks/        # Custom React Hooks
│   │   ├── layouts/      # Layouts de páginas
│   │   ├── lib/          # Utilidades y helpers
│   │   ├── pages/        # Páginas de la aplicación
│   │   │   ├── Admin/    # Páginas de administración
│   │   │   └── auth/     # Páginas de autenticación
│   │   ├── types/        # Definiciones de tipos TypeScript
│   │   ├── app.tsx       # Componente raíz de la aplicación
│   │   └── ssr.tsx       # Configuración de Server-Side Rendering
│   └── views/            # Vistas Blade (minimal uso)
├── routes/
│   ├── api.php           # Rutas de API
│   ├── auth.php          # Rutas de autenticación
│   ├── settings.php      # Rutas de configuración
│   └── web.php           # Rutas web principales
├── storage/
│   ├── app/              # Archivos de aplicación
│   │   ├── public/       # Archivos públicos accesibles
│   │   └── private/      # Archivos privados
│   ├── framework/        # Archivos del framework
│   └── logs/             # Logs de la aplicación
├── tests/                # Tests automatizados
│   ├── Feature/          # Tests de características
│   └── Unit/             # Tests unitarios
├── .env.example          # Ejemplo de variables de entorno
├── composer.json         # Dependencias de PHP
├── package.json          # Dependencias de JavaScript
├── tsconfig.json         # Configuración de TypeScript
├── tailwind.config.js    # Configuración de TailwindCSS
├── vite.config.ts        # Configuración de Vite
├── phpunit.xml           # Configuración de PHPUnit/Pest
└── Dockerfile            # Configuración de Docker
```

## 🗄️ Modelos de Base de Datos

### Modelos Principales

#### User (Usuario)
Gestiona los usuarios del sistema con soporte para roles.
```php
- id
- name
- email
- password
- email_verified_at
- role (enum: 'user', 'admin')
- remember_token
- timestamps
```

#### Product (Producto)
Catálogo de productos disponibles para la venta.
```php
- id
- name
- description
- price
- image (JSON - múltiples imágenes)
- stock
- reserved_stock
- active (boolean)
- type (tipo de producto)
- marca
- modelo
- numero_piezas
- presentacion
- dimensions (JSON: weight, length, width, height)
- audio_path (para productos tipo bocina)
- color_variants (JSON)
- timestamps
```

#### Order (Orden/Pedido)
Representa las órdenes de compra realizadas por los usuarios.
```php
- id
- user_id
- total
- status (enum: pending, processing, completed, cancelled, rejected)
- payment_method (enum: openpay, manual)
- shipping_name
- shipping_phone
- shipping_email
- shipping_address
- shipping_city
- shipping_state
- shipping_postal_code
- shipping_cost
- dhl_tracking_number
- dhl_label_url
- dhl_confirmation_number
- dhl_shipment_date
- dhl_estimated_delivery
- dhl_label_created_at
- dhl_pickup_scheduled_at
- invoice_* (campos de facturación)
- timestamps
```

#### OrderItem (Artículo de Orden)
Productos incluidos en cada orden.
```php
- id
- order_id
- product_id
- quantity
- price
- timestamps
```

#### ShoppingCart (Carrito de Compras)
Carrito de compras persistente por usuario.
```php
- id
- user_id
- timestamps
```

#### CartItem (Artículo del Carrito)
Productos en el carrito del usuario.
```php
- id
- cart_id
- product_id
- quantity
- timestamps
```

#### Address (Dirección)
Direcciones guardadas de los usuarios.
```php
- id
- user_id
- name
- phone
- email
- address
- city
- estado (state)
- postal_code
- country
- is_default (boolean)
- timestamps
```

#### Payment (Pago)
Registro de transacciones de pago.
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

#### PaymentProof (Comprobante de Pago)
Comprobantes de pago manual subidos por usuarios.
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
Publicaciones de vacantes de empleo.
```php
- id
- title
- description
- requirements (text)
- benefits (text)
- location
- salary_range
- employment_type
- department
- contact_email
- contact_phone
- status (enum: active, inactive)
- expires_at
- timestamps
```

#### Catalog (Catálogo)
Catálogos PDF descargables.
```php
- id
- name
- description
- file_path
- image_path
- is_active (boolean)
- order
- timestamps
```

#### DhlPickup (Recolección DHL)
Registro de recolecciones programadas con DHL.
```php
- id
- pickup_date
- ready_time
- close_time
- confirmation_number
- status
- metadata (JSON)
- timestamps
```

## 🔐 Autenticación y Autorización

### Roles de Usuario

El sistema implementa dos roles principales:

1. **Usuario (user)**: Clientes regulares que pueden:
   - Navegar el catálogo de productos
   - Agregar productos al carrito
   - Realizar órdenes
   - Ver historial de órdenes
   - Subir comprobantes de pago
   - Gestionar direcciones de envío

2. **Administrador (admin)**: Personal administrativo que puede:
   - Todo lo que puede hacer un usuario
   - Gestionar productos (CRUD completo)
   - Ver y gestionar todas las órdenes
   - Aprobar/rechazar comprobantes de pago
   - Sincronizar inventario
   - Generar etiquetas de envío DHL
   - Gestionar vacantes
   - Gestionar catálogos
   - Configurar familias de productos
   - Ver reportes y estadísticas

### Middleware de Protección

- `auth`: Verifica que el usuario esté autenticado
- `verified`: Verifica que el email del usuario esté verificado
- `AdminMiddleware`: Verifica que el usuario tenga rol de administrador

## 🛣️ Rutas Principales

### Rutas Públicas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Página principal (home) |
| GET | `/{tab}` | Navegación por tabs (productos, nosotros, sucursales, etc.) |
| GET | `/api/vacancies` | Lista de vacantes disponibles |
| GET | `/api/catalogs` | Catálogos públicos |
| GET | `/postal-info/{cp}` | Información de código postal |

### Rutas Autenticadas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/dashboard` | Dashboard del usuario |
| GET | `/cart` | Ver carrito de compras |
| POST | `/cart/add` | Agregar producto al carrito |
| DELETE | `/cart/remove/{id}` | Eliminar producto del carrito |
| PUT | `/cart/update` | Actualizar cantidad en carrito |
| POST | `/orders` | Crear nueva orden |
| GET | `/orders` | Lista de órdenes del usuario |
| GET | `/orders/{id}` | Detalle de orden |
| POST | `/orders/{id}/cancel` | Cancelar orden |
| POST | `/orders/{orderId}/payment-proof` | Subir comprobante de pago |
| POST | `/addresses` | Guardar dirección |
| GET | `/addresses` | Listar direcciones del usuario |

### Rutas de Administración

Todas las rutas administrativas están bajo el prefijo `/admin` y requieren autenticación + rol de administrador.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/admin/dashboard` | Dashboard administrativo |
| GET | `/admin/orders` | Lista todas las órdenes |
| GET | `/admin/orders/{id}` | Detalle de orden |
| PUT | `/admin/orders/{id}/status` | Actualizar estado de orden |
| GET | `/admin/orders/{id}/shipping-pdf` | Generar PDF de orden de surtido |
| GET | `/admin/orders/{id}/label-pdf` | Descargar etiqueta DHL |
| GET | `/admin/products` | Lista de productos |
| POST | `/admin/products` | Crear producto |
| PUT | `/admin/products/{id}` | Actualizar producto |
| DELETE | `/admin/products/{id}` | Eliminar producto |
| PUT | `/admin/products/{id}/toggle-status` | Activar/desactivar producto |
| POST | `/admin/products/sync-stock` | Sincronizar inventario |
| POST | `/admin/products/{id}/audio` | Subir audio para bocinas |
| GET | `/admin/payment-proofs` | Lista de comprobantes pendientes |
| POST | `/admin/payment-proofs/{id}/approve` | Aprobar comprobante |
| POST | `/admin/payment-proofs/{id}/reject` | Rechazar comprobante |
| Resource | `/admin/vacancies` | CRUD de vacantes |
| Resource | `/admin/catalogs` | CRUD de catálogos |

### Rutas de Pago (Openpay)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/create-openpay-checkout` | Crear sesión de pago |
| GET | `/payment-success` | Página de pago exitoso |
| GET | `/payment-cancelled` | Página de pago cancelado |
| GET | `/payment-error-page` | Página de error en pago |
| POST | `/openpay/webhook` | Webhook de Openpay |

### Rutas de API (DHL)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/dhl/rate` | Cotizar envío |
| POST | `/api/dhl/rate-cart` | Cotizar envío para carrito |

## 🔌 Integraciones Externas

### Openpay - Procesamiento de Pagos

**Descripción**: Pasarela de pagos mexicana que permite procesar pagos con tarjeta de crédito/débito.

**Funcionalidades Implementadas**:
- Creación de sesiones de checkout
- Procesamiento de pagos
- Webhooks para actualización de estados
- Reembolsos y cancelaciones
- Manejo de pagos 3D Secure

**Archivos Relacionados**:
- `app/Http/Controllers/OpenpayCheckoutController.php`
- `app/Http/Controllers/OpenpayWebhookController.php`
- `app/Models/Payment.php`

**Flujo de Pago**:
1. Usuario completa carrito y selecciona pago con tarjeta
2. Sistema crea checkout en Openpay con `createCheckout()`
3. Usuario es redirigido a Openpay para ingresar datos de tarjeta
4. Openpay procesa el pago y notifica vía webhook
5. Sistema actualiza estado de orden según resultado

### DHL Express - Envíos y Logística

**Descripción**: Servicio de mensajería internacional para cotización, creación de guías y seguimiento de envíos.

**Funcionalidades Implementadas**:
- Cotización de tarifas de envío
- Creación de guías de envío (shipments)
- Generación de etiquetas PDF
- Programación de recolecciones (pickups)
- Seguimiento de envíos

**Archivos Relacionados**:
- `app/Services/DhlRateService.php` - Cotizaciones
- `app/Services/DhlShipmentService.php` - Creación de guías
- `app/Services/DHLPickupService.php` - Recolecciones
- `app/Http/Controllers/Api/ShippingRateController.php`

**Flujo de Envío**:
1. Usuario ingresa dirección de entrega
2. Sistema cotiza con DHL usando peso y dimensiones de productos
3. Usuario confirma orden con costo de envío
4. Administrador genera guía DHL desde panel admin
5. Sistema programa recolección automática
6. DHL recoge paquete y actualiza tracking

### Ultramsg - Notificaciones WhatsApp

**Descripción**: Servicio para envío de notificaciones automáticas por WhatsApp.

**Uso en el Sistema**:
- Notificaciones de nuevas órdenes
- Confirmación de pagos
- Actualizaciones de envío
- Alertas administrativas

**Archivos Relacionados**:
- Se integra mediante el SDK `ultramsg/whatsapp-php-sdk`
- Configuración en `.env` con token e instance ID

### PHPMailer - Correo Electrónico

**Descripción**: Biblioteca para envío de correos electrónicos con soporte SMTP.

**Uso en el Sistema**:
- Confirmación de órdenes
- Notificaciones de cambios de estado
- Recuperación de contraseña
- Facturas electrónicas
- Comunicación con clientes

**Archivos Relacionados**:
- `app/Services/Mail/PhpMailService.php`
- Configuración SMTP en `.env`

## 🎯 Características Principales

### Para Usuarios

#### 1. Catálogo de Productos
- Navegación por tipos de productos
- Búsqueda y filtrado
- Vista detallada con múltiples imágenes
- Información de stock en tiempo real
- Variantes de color para productos aplicables
- Audio de demostración para bocinas

#### 2. Carrito de Compras
- Carrito persistente (guardado en BD)
- Actualización de cantidades
- Validación de stock disponible
- Cálculo automático de subtotales
- Estimación de envío con DHL

#### 3. Proceso de Checkout
- Múltiples métodos de pago:
  - Pago en línea con Openpay (tarjetas)
  - Transferencia/depósito bancario manual
- Guardado de direcciones de envío
- Cotización automática de envío
- Facturación electrónica (opcional)

#### 4. Gestión de Órdenes
- Historial completo de órdenes
- Seguimiento de estado en tiempo real
- Tracking de envío DHL
- Descarga de facturas PDF
- Subida de comprobantes de pago para transferencias
- Cancelación de órdenes (cuando aplique)

### Para Administradores

#### 1. Gestión de Productos
- CRUD completo de productos
- Carga múltiple de imágenes
- Gestión de variantes de color
- Control de inventario y stock reservado
- Activación/desactivación de productos
- Sincronización con base de datos de almacén externa
- Reportes de productos sin stock
- Detección de incidencias (sobreventas)
- Gestión de audio para productos tipo bocina

#### 2. Gestión de Órdenes
- Vista de todas las órdenes del sistema
- Filtrado por estado y fechas
- Actualización de estados de orden
- Aprobación/rechazo de comprobantes de pago
- Generación de órdenes de surtido (PDF)
- Sincronización de estados de pago con Openpay

#### 3. Logística y Envíos
- Creación automática de guías DHL
- Descarga de etiquetas de envío
- Programación de recolecciones
- Vista de pickups programados
- Tracking automático de envíos

#### 4. Gestión de Contenido
- Publicación de vacantes de empleo
- Subida y gestión de catálogos PDF
- Configuración de familias de productos
- Ordenamiento de tipos de productos
- Gestión de orden de visualización

#### 5. Reportes y Estadísticas
- Reporte de productos sin stock
- Incidencias de inventario
- Conteo de órdenes por estado
- Seguimiento de pagos pendientes

## 📊 Flujos de Trabajo Principales

### Flujo de Compra del Cliente

```
1. Cliente navega catálogo
   ↓
2. Agrega productos al carrito
   ↓
3. Revisa carrito y procede a checkout
   ↓
4. Ingresa/selecciona dirección de envío
   ↓
5. Sistema cotiza envío con DHL
   ↓
6. Cliente selecciona método de pago
   ↓
   ├─→ Openpay (Tarjeta)
   │   ├─→ Redirige a Openpay
   │   ├─→ Cliente ingresa datos de tarjeta
   │   ├─→ Openpay procesa pago
   │   └─→ Webhook actualiza orden
   │
   └─→ Pago Manual (Transferencia)
       ├─→ Sistema genera orden con estado "pending"
       ├─→ Cliente recibe datos bancarios
       ├─→ Cliente realiza transferencia
       └─→ Cliente sube comprobante
           ├─→ Admin revisa comprobante
           └─→ Admin aprueba/rechaza
```

### Flujo de Procesamiento de Orden

```
1. Orden creada (status: pending)
   ↓
2. Pago confirmado
   ├─→ Stock reservado
   └─→ Status actualizado a "processing"
   ↓
3. Admin genera orden de surtido (PDF)
   ├─→ Lista de productos con ubicaciones
   └─→ Datos de cliente y envío
   ↓
4. Almacén prepara paquete
   ↓
5. Admin crea guía DHL
   ├─→ Sistema genera shipment en DHL
   ├─→ Etiqueta PDF descargada
   └─→ Pickup automáticamente programado
   ↓
6. DHL recoge paquete
   ├─→ Tracking number activo
   └─→ Cliente recibe notificaciones
   ↓
7. Paquete entregado
   └─→ Status actualizado a "completed"
```

### Flujo de Sincronización de Inventario

```
1. Admin ejecuta "Sincronizar Stock"
   ↓
2. Sistema consulta base de datos de almacén (conexión secundaria)
   ├─→ Obtiene stock actualizado por SKU
   └─→ Compara con stock actual en sistema
   ↓
3. Sistema actualiza stock de productos
   ├─→ Stock físico actualizado
   ├─→ Stock reservado mantenido
   └─→ Stock disponible = físico - reservado
   ↓
4. Sistema detecta incidencias
   ├─→ Identifica sobreventas (reservado > físico)
   └─→ Marca productos con problemas
   ↓
5. Admin revisa incidencias
   └─→ Contacta clientes afectados si es necesario
```

## 🐳 Despliegue con Docker

El proyecto incluye un `Dockerfile` para facilitar el despliegue:

### Construir la imagen

```bash
docker build -t refacciones-elboom .
```

### Ejecutar el contenedor

```bash
docker run -p 8000:8000 \
  -e APP_KEY=base64:... \
  -e DB_CONNECTION=mysql \
  -e DB_HOST=host.docker.internal \
  -e DB_DATABASE=refacciones \
  -e DB_USERNAME=root \
  -e DB_PASSWORD=secret \
  refacciones-elboom
```

### Docker Compose (Recomendado)

Crear un archivo `docker-compose.yml`:

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
      - DB_PASSWORD=secret
    depends_on:
      - db
    volumes:
      - ./storage:/var/www/html/storage

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: secret
      MYSQL_DATABASE: refacciones
    volumes:
      - db_data:/var/lib/mysql
    ports:
      - "3306:3306"

volumes:
  db_data:
```

Ejecutar:
```bash
docker-compose up -d
```

## 🧪 Testing

El proyecto utiliza Pest PHP para pruebas automatizadas.

### Ejecutar todos los tests

```bash
php artisan test
```

o con Pest directamente:

```bash
./vendor/bin/pest
```

### Ejecutar tests específicos

```bash
php artisan test --filter=NombreDelTest
```

### Cobertura de código

```bash
./vendor/bin/pest --coverage
```

## 🔧 Comandos Útiles de Artisan

### Desarrollo

```bash
# Limpiar caché
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Optimizar para producción
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Crear enlace simbólico de storage
php artisan storage:link

# Ver todas las rutas
php artisan route:list

# Ejecutar migraciones
php artisan migrate
php artisan migrate:fresh --seed

# Ejecutar queue worker
php artisan queue:work
php artisan queue:listen

# Ver logs en tiempo real
php artisan pail
```

### Generadores

```bash
# Crear modelo con migración, factory y seeder
php artisan make:model NombreModelo -mfs

# Crear controlador
php artisan make:controller NombreController

# Crear middleware
php artisan make:middleware NombreMiddleware

# Crear job
php artisan make:job NombreJob

# Crear service
php artisan make:service NombreService
```

## 📱 Comandos NPM

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo con HMR
npm run build        # Build de producción
npm run build:ssr    # Build con SSR (Server-Side Rendering)

# Code Quality
npm run lint         # Ejecutar ESLint
npm run format       # Formatear código con Prettier
npm run format:check # Verificar formato
npm run types        # Verificar tipos TypeScript
```

## 🎨 Convenciones de Código

### PHP (Laravel)

- Seguir PSR-12 para estilo de código
- Usar Laravel Pint para formateo automático: `./vendor/bin/pint`
- Nombres de clases en PascalCase
- Nombres de métodos en camelCase
- Nombres de variables en snake_case para base de datos
- Comentarios DocBlock para métodos públicos

### TypeScript/React

- Usar TypeScript strict mode
- Componentes funcionales con hooks
- Props tipadas con interfaces
- Nombres de componentes en PascalCase
- Nombres de archivos en kebab-case o PascalCase
- Usar Prettier para formateo: `npm run format`
- Seguir las reglas de ESLint configuradas

### Base de Datos

- Nombres de tablas en plural y snake_case
- Nombres de columnas en snake_case
- Usar migraciones para todos los cambios de esquema
- Incluir índices para columnas de búsqueda frecuente
- Usar foreign keys con cascadas apropiadas

## 🔒 Seguridad

### Consideraciones de Seguridad Implementadas

1. **Autenticación**
   - Passwords hasheados con Bcrypt (12 rounds)
   - Verificación de email obligatoria
   - Sistema de recuperación de contraseña seguro

2. **Autorización**
   - Middleware para verificación de roles
   - Protección de rutas administrativas
   - Validación de permisos en controladores

3. **Protección CSRF**
   - Token CSRF en todos los formularios
   - Validación automática por Laravel
   - Excepciones para webhooks externos

4. **Validación de Datos**
   - Validación de entrada en todos los endpoints
   - Sanitización de datos antes de guardar
   - Type-safety con TypeScript en frontend

5. **SQL Injection**
   - Uso de Eloquent ORM
   - Prepared statements automáticos
   - Nunca concatenación directa de SQL

6. **XSS (Cross-Site Scripting)**
   - Escape automático de datos en React
   - Sanitización de HTML cuando es necesario
   - Content Security Policy headers

7. **Gestión de Archivos**
   - Validación de tipos de archivo
   - Límites de tamaño
   - Almacenamiento seguro en storage privado
   - Verificación de permisos antes de descargas

8. **API Keys y Secretos**
   - Almacenamiento en variables de entorno
   - Nunca en código fuente
   - Rotación periódica recomendada

### Recomendaciones para Producción

1. Usar HTTPS en producción
2. Configurar `APP_DEBUG=false`
3. Limitar intentos de login
4. Implementar rate limiting en APIs
5. Realizar backups regulares de la base de datos
6. Mantener dependencias actualizadas
7. Monitorear logs de errores y accesos
8. Usar firewalls y protección DDoS

## 📚 Recursos Adicionales

### Documentación Oficial

- [Laravel 12 Documentation](https://laravel.com/docs/12.x)
- [React 19 Documentation](https://react.dev)
- [Inertia.js Guide](https://inertiajs.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Components](https://www.radix-ui.com)

### APIs Externas

- [Openpay API Reference](https://www.openpay.mx/docs/)
- [DHL Express API](https://developer.dhl.com/api-reference/dhl-express-mydhl-api)
- [Ultramsg WhatsApp API](https://ultramsg.com/docs/)

## 🤝 Contribución

### Proceso de Contribución

1. Fork el repositorio
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

### Estándares de Código

- Ejecutar linters antes de commit
- Incluir tests para nuevas funcionalidades
- Actualizar documentación según corresponda
- Seguir las convenciones de código establecidas

## 📄 Licencia

Este proyecto es privado y propietario. Todos los derechos reservados.

## 👥 Equipo de Desarrollo

- **Desarrollador Principal**: ChrisAle117
- **Repositorio**: [github.com/ChrisAle117/RefaccionesElBoom](https://github.com/ChrisAle117/RefaccionesElBoom)

## 📞 Soporte

Para reportar bugs o solicitar nuevas características, por favor abre un issue en el repositorio de GitHub.

---

**Última actualización**: Enero 2026
**Versión del Sistema**: Laravel 12 + React 19
