# BarberPro 💈

Full-stack barber management SaaS

## Stack
- Laravel 12 (API)
- React + TypeScript (Frontend)
- MySQL
- Sanctum Auth

## Features
- Admin dashboard
- Client management
- Appointments system
- Barber management
- Client space (booking + profile)

## Setup

### Backend
cd barberpro-api
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve

### Frontend
cd barberpro-web
npm install
npm run dev
