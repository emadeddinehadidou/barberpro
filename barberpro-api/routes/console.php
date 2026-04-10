<?php

use App\Models\Appointment;
use App\Services\AppointmentNotificationService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('appointments:send-reminders', function (AppointmentNotificationService $notifications) {
    $now = now();
    $cutoff = $now->copy()->addHour();

    Appointment::with(['client.user', 'barber', 'service'])
        ->whereNull('reminder_sent_at')
        ->whereIn('status', ['pending', 'confirmed'])
        ->whereDate('appointment_date', $now->toDateString())
        ->get()
        ->filter(function (Appointment $appointment) use ($now, $cutoff) {
            $start = $appointment->appointment_date
                ->copy()
                ->setTimeFromTimeString($appointment->start_time);

            return $start->between($now, $cutoff);
        })
        ->each(function (Appointment $appointment) use ($notifications) {
            $notifications->reminder($appointment);
            $appointment->forceFill(['reminder_sent_at' => now()])->save();
        });

    $this->info('Appointment reminders sent.');
})->purpose('Send appointment reminders for the next hour');

Schedule::command('appointments:send-reminders')->everyFiveMinutes();
