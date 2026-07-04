FROM php:8.4-cli-alpine AS base

RUN apk add --no-cache \
    bash \
    icu-dev \
    libzip-dev \
    oniguruma-dev \
    postgresql-dev \
    && docker-php-ext-install pdo_pgsql

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

FROM base AS dev

COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --no-scripts

COPY . .
RUN composer dump-autoload

EXPOSE 8000

CMD ["sh", "docker/start.sh"]

FROM base AS production

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts

COPY . .
RUN composer dump-autoload --optimize
RUN php artisan config:clear && php artisan route:clear && php artisan view:clear

EXPOSE 8000

CMD ["sh", "docker/start.sh"]
