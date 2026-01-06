# Guía de Inicio Rápido - RefaccionesElBoom

## ⚡ Iniciar en 5 Minutos

Esta guía te ayudará a tener el proyecto funcionando localmente lo más rápido posible.

## 📋 Requisitos Previos

Asegúrate de tener instalado:
- ✅ PHP 8.2 o superior
- ✅ Composer
- ✅ Node.js 20.x LTS
- ✅ npm

## 🚀 Pasos de Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/ChrisAle117/RefaccionesElBoom.git
cd RefaccionesElBoom
```

### 2. Instalar Dependencias

```bash
# Instalar dependencias PHP
composer install

# Instalar dependencias JavaScript
npm install
```

### 3. Configurar el Entorno

```bash
# Copiar archivo de configuración
cp .env.example .env

# Generar clave de aplicación
php artisan key:generate

# Crear base de datos SQLite (para desarrollo)
touch database/database.sqlite
```

### 4. Configurar Base de Datos

Edita el archivo `.env` y asegúrate que tenga:

```env
DB_CONNECTION=sqlite
```

### 5. Ejecutar Migraciones

```bash
php artisan migrate
```

### 6. Crear Enlace para Storage

```bash
php artisan storage:link
```

### 7. Iniciar el Servidor

```bash
composer dev
```

Este comando iniciará automáticamente:
- 🌐 Servidor Laravel en http://localhost:8000
- 📦 Queue worker
- ⚡ Vite dev server

**¡Listo!** Abre http://localhost:8000 en tu navegador.

## 👤 Crear Usuario Administrador (Opcional)

Para acceder al panel de administración, necesitas crear un usuario admin:

```bash
php artisan tinker
```

En la consola de tinker:

```php
$user = new App\Models\User();
$user->name = 'Admin';
$user->email = 'admin@ejemplo.com';
$user->password = bcrypt('password');
$user->role = 'admin';
$user->email_verified_at = now();
$user->save();
exit
```

**Credenciales:**
- Email: `admin@ejemplo.com`
- Password: `password`

Ahora puedes acceder a http://localhost:8000/admin/dashboard

## 🧪 Datos de Prueba (Opcional)

Para poblar la base de datos con datos de ejemplo:

```bash
php artisan db:seed
```

## 🔧 Comandos Útiles

```bash
# Ver todas las rutas
php artisan route:list

# Limpiar cachés (si algo no funciona)
php artisan optimize:clear

# Formatear código PHP
./vendor/bin/pint

# Formatear código JavaScript
npm run format

# Ejecutar tests
php artisan test
```

## 🆘 Problemas Comunes

### Error: "Class not found"
```bash
composer dump-autoload
```

### Error: Permisos en storage
```bash
chmod -R 775 storage bootstrap/cache
```

### Error: Assets no cargan
```bash
npm run build
php artisan optimize:clear
```

### Puerto 8000 ya en uso
```bash
# Usar otro puerto
php artisan serve --port=8001
```

## 📚 Siguiente Paso

Ahora que tienes el proyecto funcionando, te recomendamos revisar:

1. **[README.md](README.md)** - Documentación completa del proyecto
2. **[CONTRIBUTING.md](CONTRIBUTING.md)** - Guía para desarrolladores
3. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Arquitectura del sistema
4. **[API.md](API.md)** - Documentación de endpoints
5. **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guía de despliegue

## 💡 Estructura del Proyecto

```
RefaccionesElBoom/
├── app/                    # Código PHP de Laravel
│   ├── Http/Controllers/   # Controladores
│   ├── Models/            # Modelos Eloquent
│   └── Services/          # Servicios de negocio
├── resources/
│   └── js/                # Código React/TypeScript
│       ├── pages/         # Páginas de Inertia
│       └── components/    # Componentes React
├── routes/
│   ├── web.php           # Rutas principales
│   └── auth.php          # Rutas de autenticación
├── database/
│   └── migrations/       # Migraciones de BD
└── public/               # Archivos públicos
```

## 🎯 Características Principales

- 🛒 **E-commerce completo** para refacciones automotrices
- 💳 **Pagos integrados** con Openpay
- 📦 **Envíos con DHL** (cotización y guías)
- 👨‍💼 **Panel de administración** completo
- 📱 **Responsive** y moderno
- 🔐 **Autenticación** y roles de usuario

## 🤝 Contribuir

¿Quieres contribuir al proyecto? Lee [CONTRIBUTING.md](CONTRIBUTING.md) para conocer las convenciones y el flujo de trabajo.

## 📞 Soporte

- **Issues**: https://github.com/ChrisAle117/RefaccionesElBoom/issues
- **Desarrollador**: ChrisAle117

---

**¡Feliz coding!** 🚀
