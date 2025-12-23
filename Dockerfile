# syntax=docker/dockerfile:1

# Pin composer to PHP 8.2 to satisfy dependencies that require <=8.4
FROM composer:2.7-php8.2-alpine AS vendor
WORKDIR /app
COPY . /app
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress --optimize-autoloader --no-scripts

FROM node:20 AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-fund --no-audit
COPY . /app
RUN npm run build

FROM php:8.2-cli AS runtime
WORKDIR /var/www/html
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN apt-get update \
    && apt-get install -y git unzip libzip-dev libpng-dev libicu-dev libxml2-dev \
    && docker-php-ext-install pdo_mysql pdo_sqlite bcmath intl gd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
RUN mkdir -p database && touch database/database.sqlite
COPY --from=vendor /app /var/www/html
COPY --from=frontend /app/public/build /var/www/html/public/build
RUN ln -snf /var/www/html/storage/app/public /var/www/html/public/storage || true
RUN chown -R www-data:www-data storage bootstrap/cache
EXPOSE 8000
CMD ["sh", "-c", "php artisan serve --host 0.0.0.0 --port ${PORT:-8000}"]
