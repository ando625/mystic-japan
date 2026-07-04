#!/bin/sh
set -e

if [ ! -d vendor ]; then
  composer install --no-interaction --prefer-dist
fi

php artisan config:clear
php artisan migrate --force

if [ "${RUN_DATABASE_SEEDER:-true}" = "true" ]; then
  php artisan db:seed --force
fi

php artisan serve --host=0.0.0.0 --port="${PORT:-8000}"
