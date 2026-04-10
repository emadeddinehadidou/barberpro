<?php

namespace App\Notifications;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AppointmentNotification extends Notification
{
    use Queueable;

    private Appointment $appointment;
    private string $event;
    private string $title;
    private string $body;
    private bool $sendMail;
    private array $changes;

    public function __construct(
        Appointment $appointment,
        string $event,
        string $title,
        string $body,
        array $changes = [],
        bool $sendMail = false,
    ) {
        $this->appointment = $appointment;
        $this->event = $event;
        $this->title = $title;
        $this->body = $body;
        $this->changes = $changes;
        $this->sendMail = $sendMail;
    }

    public function via(object $notifiable): array
    {
        $channels = ['database'];

        if (
            $this->sendMail &&
            !empty($notifiable->email) &&
            !empty(config('mail.from.address'))
        ) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        $appointment = $this->appointment->loadMissing(['barber', 'service']);

        return (new MailMessage())
            ->subject($this->title)
            ->greeting('Bonjour ' . ($notifiable->name ?? ''))
            ->line($this->body)
            ->line('Service : ' . ($appointment->service?->name ?? 'Service'))
            ->line('Barbier : ' . ($appointment->barber?->name ?? 'Barbier'))
            ->line('Date : ' . $appointment->appointment_date->format('Y-m-d'))
            ->line('Heure : ' . substr($appointment->start_time, 0, 5) . ' - ' . substr($appointment->end_time, 0, 5))
            ->when(!empty($this->changes), function (MailMessage $message) {
                foreach ($this->changes as $change) {
                    $message->line($change);
                }

                return $message;
            });
    }

    public function toArray(object $notifiable): array
    {
        $appointment = $this->appointment->loadMissing(['barber', 'service']);

        return [
            'title' => $this->title,
            'body' => $this->body,
            'event' => $this->event,
            'appointment_id' => $appointment->id,
            'status' => $appointment->status,
            'appointment_date' => $appointment->appointment_date->format('Y-m-d'),
            'start_time' => $appointment->start_time,
            'end_time' => $appointment->end_time,
            'service_name' => $appointment->service?->name,
            'barber_name' => $appointment->barber?->name,
            'changes' => $this->changes,
        ];
    }
}
