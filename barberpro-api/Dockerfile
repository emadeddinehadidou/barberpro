FROM php:8.3-apache

ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    PORT=8080 \
    COMPOSER_ALLOW_SUPERUSER=1

WORKDIR /var/www/html

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        unzip \
        libzip-dev \
    && docker-php-ext-install \
        pdo \
        pdo_mysql \
        zip \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --classmap-authoritative

COPY . .
COPY apache-vhost.conf /etc/apache2/sites-available/000-default.conf
COPY start-apache.sh /usr/local/bin/start-apache.sh

RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R ug+rwx storage bootstrap/cache \
    && chmod +x /usr/local/bin/start-apache.sh

EXPOSE 8080

CMD ["/usr/local/bin/start-apache.sh"]
