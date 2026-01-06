# Guía de Despliegue - RefaccionesElBoom

## 🚀 Opciones de Despliegue

Este documento cubre las diferentes opciones para desplegar RefaccionesElBoom en producción:

1. Servidor VPS/Dedicado tradicional
2. Docker/Kubernetes
3. Plataformas PaaS (Heroku, Railway, etc.)
4. Cloud providers (AWS, Google Cloud, Azure)

## 📋 Requisitos Previos

### Hardware Mínimo Recomendado

- **CPU**: 2 cores
- **RAM**: 4 GB
- **Disco**: 20 GB SSD
- **Ancho de banda**: 100 Mbps

### Software Requerido

- **Sistema Operativo**: Ubuntu 22.04 LTS (recomendado) o similar
- **PHP**: 8.2 o superior
- **Node.js**: 20.x LTS
- **Composer**: 2.x
- **Base de Datos**: MySQL 8.0+ o SQLite
- **Servidor Web**: Nginx (recomendado) o Apache
- **Supervisor**: Para queue workers
- **SSL/TLS**: Certificado (Let's Encrypt recomendado)

## 🔧 Opción 1: Despliegue en VPS/Servidor Dedicado

### Paso 1: Preparar el Servidor

#### 1.1 Actualizar el Sistema
```bash
sudo apt update
sudo apt upgrade -y
```

#### 1.2 Instalar PHP 8.2 y Extensiones
```bash
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:ondrej/php
sudo apt update

sudo apt install -y php8.2 php8.2-fpm php8.2-cli php8.2-common \
    php8.2-mysql php8.2-zip php8.2-gd php8.2-mbstring \
    php8.2-curl php8.2-xml php8.2-bcmath php8.2-sqlite3 \
    php8.2-intl
```

#### 1.3 Instalar Composer
```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
composer --version
```

#### 1.4 Instalar Node.js y npm
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

#### 1.5 Instalar MySQL (si se usa MySQL)
```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Crear base de datos
sudo mysql
```

```sql
CREATE DATABASE refacciones_elboom CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'refacciones_user'@'localhost' IDENTIFIED BY 'tu_password_seguro';
GRANT ALL PRIVILEGES ON refacciones_elboom.* TO 'refacciones_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 1.6 Instalar Nginx
```bash
sudo apt install -y nginx
```

#### 1.7 Instalar Supervisor
```bash
sudo apt install -y supervisor
```

### Paso 2: Clonar y Configurar el Proyecto

#### 2.1 Crear Directorio y Clonar
```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/ChrisAle117/RefaccionesElBoom.git refacciones
cd refacciones
```

#### 2.2 Configurar Permisos
```bash
sudo chown -R www-data:www-data /var/www/refacciones
sudo chmod -R 755 /var/www/refacciones
sudo chmod -R 775 /var/www/refacciones/storage
sudo chmod -R 775 /var/www/refacciones/bootstrap/cache
```

#### 2.3 Instalar Dependencias PHP
```bash
composer install --no-dev --optimize-autoloader
```

#### 2.4 Instalar Dependencias JavaScript
```bash
npm ci --no-fund --no-audit
```

#### 2.5 Configurar Variables de Entorno
```bash
cp .env.example .env
nano .env
```

**Configuración mínima necesaria:**
```env
APP_NAME="RefaccionesElBoom"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://tudominio.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=refacciones_elboom
DB_USERNAME=refacciones_user
DB_PASSWORD=tu_password_seguro

# Openpay
OPENPAY_MERCHANT_ID=tu_merchant_id
OPENPAY_PRIVATE_KEY=tu_private_key
OPENPAY_PUBLIC_KEY=tu_public_key
OPENPAY_SANDBOX=false

# DHL
DHL_API_USERNAME=tu_username
DHL_API_PASSWORD=tu_password
DHL_ACCOUNT_NUMBER=tu_cuenta
DHL_BASE_URL=https://express.api.dhl.com/mydhlapi

# Email
MAIL_MAILER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=tu_correo@gmail.com
SMTP_PASSWORD=tu_password
SMTP_ENCRYPTION=tls

# Queue
QUEUE_CONNECTION=database
```

#### 2.6 Generar APP_KEY
```bash
php artisan key:generate
```

#### 2.7 Ejecutar Migraciones
```bash
php artisan migrate --force
```

#### 2.8 Crear Enlace Simbólico de Storage
```bash
php artisan storage:link
```

#### 2.9 Compilar Assets
```bash
npm run build
```

#### 2.10 Optimizar para Producción
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

### Paso 3: Configurar Nginx

#### 3.1 Crear Archivo de Configuración
```bash
sudo nano /etc/nginx/sites-available/refacciones
```

**Contenido:**
```nginx
server {
    listen 80;
    listen [::]:80;
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

    # Cachear assets estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Limitar tamaño de uploads
    client_max_body_size 20M;
}
```

#### 3.2 Habilitar el Sitio
```bash
sudo ln -s /etc/nginx/sites-available/refacciones /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Paso 4: Configurar SSL con Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```

Certbot configurará automáticamente HTTPS en Nginx.

### Paso 5: Configurar Queue Worker con Supervisor

#### 5.1 Crear Archivo de Configuración
```bash
sudo nano /etc/supervisor/conf.d/refacciones-worker.conf
```

**Contenido:**
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

#### 5.2 Iniciar Supervisor
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start refacciones-worker:*
```

#### 5.3 Verificar Estado
```bash
sudo supervisorctl status
```

### Paso 6: Configurar Cron para Tareas Programadas

```bash
sudo crontab -e -u www-data
```

**Agregar:**
```
* * * * * cd /var/www/refacciones && php artisan schedule:run >> /dev/null 2>&1
```

### Paso 7: Configurar Logs y Monitoreo

#### 7.1 Rotar Logs
```bash
sudo nano /etc/logrotate.d/refacciones
```

**Contenido:**
```
/var/www/refacciones/storage/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

## 🐳 Opción 2: Despliegue con Docker

### Paso 1: Preparar el Proyecto

El proyecto ya incluye un `Dockerfile`. Asegúrate de tener Docker instalado:

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install -y docker-compose
```

### Paso 2: Crear docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
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
      - QUEUE_CONNECTION=database
    depends_on:
      - db
      - redis
    volumes:
      - ./storage:/var/www/html/storage
      - ./public/storage:/var/www/html/public/storage
    restart: unless-stopped
    networks:
      - app-network

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: refacciones
      MYSQL_USER: refacciones
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db_data:/var/lib/mysql
    ports:
      - "3306:3306"
    restart: unless-stopped
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/conf.d:/etc/nginx/conf.d
      - ./public:/var/www/html/public
      - ./docker/ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - app-network

  worker:
    build:
      context: .
      dockerfile: Dockerfile
    command: php artisan queue:work --sleep=3 --tries=3 --max-time=3600
    environment:
      - APP_ENV=production
      - DB_CONNECTION=mysql
      - DB_HOST=db
      - DB_DATABASE=refacciones
      - DB_USERNAME=root
      - DB_PASSWORD=${DB_PASSWORD}
    depends_on:
      - db
      - redis
    volumes:
      - ./storage:/var/www/html/storage
    restart: unless-stopped
    networks:
      - app-network

volumes:
  db_data:

networks:
  app-network:
    driver: bridge
```

### Paso 3: Crear .env para Docker

```bash
cp .env.example .env.docker
```

**Editar .env.docker:**
```env
APP_KEY=base64:generada_con_artisan
DB_PASSWORD=tu_password_seguro
```

### Paso 4: Construir y Ejecutar

```bash
# Construir imágenes
docker-compose build

# Ejecutar migraciones
docker-compose run --rm app php artisan migrate --force

# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### Paso 5: Comandos Útiles Docker

```bash
# Ver estado de contenedores
docker-compose ps

# Ejecutar comandos en el contenedor
docker-compose exec app php artisan config:cache
docker-compose exec app php artisan optimize

# Reiniciar servicios
docker-compose restart

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (CUIDADO: elimina datos)
docker-compose down -v
```

## ☁️ Opción 3: Despliegue en AWS

### Arquitectura Recomendada en AWS

```
                    Internet
                        │
                        ▼
                 ┌─────────────┐
                 │  Route 53   │ (DNS)
                 └─────────────┘
                        │
                        ▼
                 ┌─────────────┐
                 │ CloudFront  │ (CDN)
                 └─────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │  Load Balancer   │ (ALB)
              └──────────────────┘
                   │         │
         ┌─────────┴─────────┴─────────┐
         ▼                             ▼
    ┌────────┐                    ┌────────┐
    │  EC2   │                    │  EC2   │
    │ (Web)  │                    │ (Web)  │
    └────────┘                    └────────┘
         │                             │
         └─────────┬───────────────────┘
                   ▼
            ┌─────────────┐
            │     RDS     │ (MySQL)
            └─────────────┘
                   │
                   ▼
            ┌─────────────┐
            │     S3      │ (Storage)
            └─────────────┘
```

### Servicios AWS a Utilizar

1. **EC2**: Servidores de aplicación
2. **RDS**: Base de datos MySQL gestionada
3. **S3**: Almacenamiento de archivos (imágenes, PDFs)
4. **CloudFront**: CDN para assets estáticos
5. **ALB**: Load balancer
6. **Route 53**: DNS
7. **Certificate Manager**: Certificados SSL
8. **CloudWatch**: Monitoreo y logs
9. **ElastiCache**: Redis para sesiones (opcional)

### Pasos Básicos de Despliegue en AWS

1. **Crear VPC y Subnets**
2. **Lanzar instancia RDS MySQL**
3. **Crear bucket S3 para storage**
4. **Lanzar instancias EC2 con la aplicación**
5. **Configurar Load Balancer**
6. **Configurar CloudFront**
7. **Configurar Route 53**

(Consultar documentación específica de AWS para detalles completos)

## 🔒 Checklist de Seguridad para Producción

- [ ] `APP_DEBUG=false` en producción
- [ ] `APP_ENV=production`
- [ ] Generar nuevo `APP_KEY` único
- [ ] Usar HTTPS/SSL obligatorio
- [ ] Configurar firewall (ufw/iptables)
- [ ] Deshabilitar listado de directorios en Nginx
- [ ] Configurar permisos correctos (755 para directorios, 644 para archivos)
- [ ] Solo storage y bootstrap/cache con permisos 775
- [ ] Mantener actualizados PHP y dependencias
- [ ] Cambiar credenciales predeterminadas de BD
- [ ] Implementar backups automáticos
- [ ] Configurar rate limiting
- [ ] Monitoreo de logs de errores
- [ ] Rotación de logs configurada
- [ ] Secrets en variables de entorno, nunca en código
- [ ] CORS configurado correctamente
- [ ] CSP (Content Security Policy) headers
- [ ] Desactivar métodos HTTP innecesarios

## 🔄 Proceso de Actualización

### Actualización en Producción

```bash
cd /var/www/refacciones

# 1. Activar modo mantenimiento
php artisan down

# 2. Backup de base de datos
php artisan backup:database

# 3. Pull de cambios
git pull origin main

# 4. Actualizar dependencias
composer install --no-dev --optimize-autoloader
npm ci --no-fund --no-audit

# 5. Ejecutar migraciones
php artisan migrate --force

# 6. Compilar assets
npm run build

# 7. Limpiar cachés
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# 8. Reiniciar workers
sudo supervisorctl restart refacciones-worker:*

# 9. Desactivar modo mantenimiento
php artisan up
```

### Rollback en Caso de Error

```bash
# 1. Activar mantenimiento
php artisan down

# 2. Volver a versión anterior
git reset --hard HEAD~1

# 3. Restaurar dependencias
composer install --no-dev
npm ci

# 4. Rollback de migraciones (si es necesario)
php artisan migrate:rollback

# 5. Reconstruir assets
npm run build

# 6. Limpiar cachés
php artisan cache:clear
php artisan optimize

# 7. Reiniciar workers
sudo supervisorctl restart refacciones-worker:*

# 8. Desactivar mantenimiento
php artisan up
```

## 📊 Monitoreo y Mantenimiento

### Logs a Monitorear

1. **Laravel Logs**: `/var/www/refacciones/storage/logs/laravel.log`
2. **Nginx Access**: `/var/log/nginx/access.log`
3. **Nginx Error**: `/var/log/nginx/error.log`
4. **PHP-FPM**: `/var/log/php8.2-fpm.log`
5. **Worker Logs**: `/var/www/refacciones/storage/logs/worker.log`
6. **MySQL Logs**: `/var/log/mysql/error.log`

### Comandos de Monitoreo

```bash
# Ver logs de Laravel en tiempo real
tail -f /var/www/refacciones/storage/logs/laravel.log

# Ver uso de recursos
htop

# Estado de servicios
sudo systemctl status nginx
sudo systemctl status php8.2-fpm
sudo systemctl status mysql
sudo supervisorctl status

# Espacio en disco
df -h

# Tamaño de directorio storage
du -sh /var/www/refacciones/storage/*
```

### Backups Automatizados

#### Script de Backup
```bash
#!/bin/bash
# /usr/local/bin/backup-refacciones.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/refacciones"
APP_DIR="/var/www/refacciones"

mkdir -p $BACKUP_DIR

# Backup de base de datos
mysqldump -u refacciones_user -p'password' refacciones_elboom > \
    $BACKUP_DIR/db_$DATE.sql

# Backup de archivos storage
tar -czf $BACKUP_DIR/storage_$DATE.tar.gz \
    $APP_DIR/storage/app

# Eliminar backups antiguos (más de 7 días)
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completado: $DATE"
```

#### Configurar Cron para Backups
```bash
sudo crontab -e
```

**Agregar:**
```
# Backup diario a las 2 AM
0 2 * * * /usr/local/bin/backup-refacciones.sh >> /var/log/backups.log 2>&1
```

## 📞 Soporte Post-Despliegue

### Contactos de Emergencia
- **Desarrollador Principal**: ChrisAle117
- **Repositorio**: https://github.com/ChrisAle117/RefaccionesElBoom

### Recursos Adicionales
- [Documentación de Laravel](https://laravel.com/docs)
- [Documentación de Inertia.js](https://inertiajs.com)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

---

**Última actualización**: Enero 2026
