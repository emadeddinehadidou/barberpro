<?php

use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BarberController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ServiceController;
use Illuminate\Support\Facades\Route;

Route::middleware('web')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/client-register', [AuthController::class, 'clientRegister']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
});

Route::middleware(['web', 'auth:sanctum'])->group(function () {
    Route::get('/dashboard/overview', [DashboardController::class, 'overview']);
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    Route::get('/barbers', [BarberController::class, 'index']);
    Route::post('/barbers', [BarberController::class, 'store']);
    Route::get('/barbers/{barber}', [BarberController::class, 'show']);
    Route::put('/barbers/{barber}', [BarberController::class, 'update']);
    Route::delete('/barbers/{barber}', [BarberController::class, 'destroy']);

    Route::apiResource('services', ServiceController::class);
    Route::apiResource('clients', ClientController::class);
    Route::apiResource('appointments', AppointmentController::class);
});