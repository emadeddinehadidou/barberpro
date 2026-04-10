<?php

use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BarberController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\NotificationController;
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
    // Dashboard - accessible to admin and barber
    Route::middleware('permission:view dashboard')->group(function () {
        Route::get('/dashboard/overview', [DashboardController::class, 'overview']);
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    });

    // Role-specific dashboards
    Route::middleware('role:admin')->get('/dashboard/admin', [DashboardController::class, 'admin']);
    Route::middleware('role:barber')->get('/dashboard/barber', [DashboardController::class, 'barber']);
    Route::middleware('role:client')->get('/dashboard/client', [DashboardController::class, 'client']);

    // Barbers management - admin only
    Route::middleware('permission:view barbers')->group(function () {
        Route::get('/barbers', [BarberController::class, 'index']);
    });
    Route::middleware('permission:create barbers')->post('/barbers', [BarberController::class, 'store']);
    Route::middleware('permission:view barbers')->get('/barbers/{barber}', [BarberController::class, 'show']);
    Route::middleware('permission:edit barbers')->put('/barbers/{barber}', [BarberController::class, 'update']);
    Route::middleware('permission:delete barbers')->delete('/barbers/{barber}', [BarberController::class, 'destroy']);

    // Services management - admin only
    Route::middleware('permission:view services')->group(function () {
        Route::get('/services', [ServiceController::class, 'index']);
        Route::get('/services/{service}', [ServiceController::class, 'show']);
    });
    Route::middleware('permission:create services')->post('/services', [ServiceController::class, 'store']);
    Route::middleware('permission:edit services')->put('/services/{service}', [ServiceController::class, 'update']);
    Route::middleware('permission:delete services')->delete('/services/{service}', [ServiceController::class, 'destroy']);

    // Clients management - admin and barber
    Route::middleware('permission:view clients')->group(function () {
        Route::get('/clients', [ClientController::class, 'index']);
        Route::get('/clients/{client}', [ClientController::class, 'show']);
    });
    Route::middleware('permission:create clients')->post('/clients', [ClientController::class, 'store']);
    Route::middleware('permission:edit clients')->put('/clients/{client}', [ClientController::class, 'update']);
    Route::middleware('permission:delete clients')->delete('/clients/{client}', [ClientController::class, 'destroy']);

    // Appointments management
    Route::middleware('permission:view appointments')->get('/appointments', [AppointmentController::class, 'index']);
    Route::middleware('permission:create appointments')->post('/appointments', [AppointmentController::class, 'store']);
    Route::middleware('permission:view appointments')->get('/appointments/{appointment}', [AppointmentController::class, 'show']);
    Route::middleware('permission:edit appointments')->put('/appointments/{appointment}', [AppointmentController::class, 'update']);
    Route::middleware('permission:delete appointments')->delete('/appointments/{appointment}', [AppointmentController::class, 'destroy']);
    Route::middleware('permission:edit appointments')->patch('/appointments/{appointment}/status', [AppointmentController::class, 'updateStatus']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::delete('/notifications', [NotificationController::class, 'destroyAll']);
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);
});

// Client routes - for client role users
Route::middleware(['web', 'auth:sanctum'])->group(function () {
    Route::middleware('role:barber')->get('/barber/appointments', [AppointmentController::class, 'barberAppointments']);
    Route::middleware('permission:book appointments')->post('/client/appointments', [AppointmentController::class, 'storeOwn']);
    Route::middleware('permission:book appointments')->put('/client/appointments/{appointment}', [AppointmentController::class, 'updateOwn']);
    Route::middleware('permission:book appointments')->get('/client/services', [ServiceController::class, 'index']);
    Route::middleware('permission:book appointments')->get('/client/barbers', [BarberController::class, 'index']);
    Route::middleware('permission:view own appointments')->get('/client/appointments', [AppointmentController::class, 'myAppointments']);
    Route::middleware('permission:view own appointments')->get('/client/appointments/{appointment}', [AppointmentController::class, 'show']);
    Route::middleware('permission:view own appointments')->patch('/client/appointments/{appointment}/status', [AppointmentController::class, 'cancelOwn']);
    Route::middleware('role:client')->get('/client/profile', [ClientController::class, 'me']);
    Route::middleware('role:client')->post('/client/profile/avatar', [ClientController::class, 'updateOwnAvatar']);
});
