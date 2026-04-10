<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\User;
use App\Notifications\AppointmentNotification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Collection;

class AppointmentNotificationService
{
    public function created(Appointment $appointment): void
    {
        $appointment->loadMissing(['client.user', 'barber', 'service']);

        $this->notifyRecipients(
            $appointment,
            'created',
            'Nouveau rendez-vous',
            sprintf(
                '%s avec %s le %s a %s.',
                $appointment->service?->name ?? 'Rendez-vous',
                $appointment->barber?->name ?? 'le barbier',
                $appointment->appointment_date->format('Y-m-d'),
                substr($appointment->start_time, 0, 5),
            ),
            [],
        );
    }

    public function updated(Appointment $appointment, array $original): void
    {
        $appointment->loadMissing(['client.user', 'barber', 'service']);

        $changes = $this->buildChanges($appointment, $original);

        if (empty($changes)) {
            return;
        }

        $isRescheduled = collect($changes)->contains(
            fn (string $change) => str_starts_with($change, 'Date') || str_starts_with($change, 'Debut') || str_starts_with($change, 'Fin')
        );

        $this->notifyRecipients(
            $appointment,
            $isRescheduled ? 'rescheduled' : 'updated',
            $isRescheduled ? 'Rendez-vous reprogramme' : 'Rendez-vous mis a jour',
            $isRescheduled
                ? 'Horaire modifie : ' . implode(' ; ', array_slice($changes, 0, 3))
                : 'Changements : ' . implode(' ; ', array_slice($changes, 0, 3)),
            $changes,
        );
    }

    public function statusChanged(Appointment $appointment, string $oldStatus): void
    {
        $appointment->loadMissing(['client.user', 'barber', 'service']);

        $event = $appointment->status === 'cancelled' ? 'cancelled' : 'status_changed';
        $title = $appointment->status === 'cancelled'
            ? 'Rendez-vous annule'
            : 'Statut du rendez-vous mis a jour';
        $changes = ['Statut: ' . $oldStatus . ' -> ' . $appointment->status];
        $body = $appointment->status === 'cancelled'
            ? 'Annulation enregistree : ' . $changes[0]
            : 'Statut modifie : ' . $changes[0];

        $this->notifyRecipients(
            $appointment,
            $event,
            $title,
            $body,
            $changes,
        );
    }

    public function reminder(Appointment $appointment): void
    {
        $appointment->loadMissing(['client.user', 'barber', 'service']);

        $this->notifyRecipients(
            $appointment,
            'reminder',
            'Rappel de rendez-vous',
            sprintf(
                '%s le %s a %s.',
                $appointment->service?->name ?? 'Rendez-vous',
                $appointment->appointment_date->format('Y-m-d'),
                substr($appointment->start_time, 0, 5),
            ),
            [],
        );
    }

    private function notifyRecipients(
        Appointment $appointment,
        string $event,
        string $title,
        string $body,
        array $changes,
    ): void {
        $recipients = $this->recipientsFor($appointment);

        foreach ($recipients as $recipient) {
            try {
                $recipient->notify(
                    new AppointmentNotification(
                        $appointment,
                        $event,
                        $title,
                        $body,
                        $changes,
                        $recipient->id === $appointment->client?->user?->id,
                    )
                );
            } catch (\Throwable $exception) {
                Log::error('Failed to send appointment notification.', [
                    'appointment_id' => $appointment->id,
                    'recipient_id' => $recipient->id,
                    'event' => $event,
                    'message' => $exception->getMessage(),
                ]);
            }
        }
    }

    private function recipientsFor(Appointment $appointment): Collection
    {
        $admins = User::query()
            ->whereIn('role', ['admin', 'super_admin'])
            ->get();

        return collect([
            $appointment->client?->user,
            $appointment->barber,
            ...$admins->all(),
        ])->filter()->unique('id')->values();
    }

    private function buildChanges(Appointment $appointment, array $original): array
    {
        $current = [
            'client_id' => $appointment->client_id,
            'barber_id' => $appointment->barber_id,
            'service_id' => $appointment->service_id,
            'appointment_date' => $appointment->appointment_date->format('Y-m-d'),
            'start_time' => $appointment->start_time,
            'end_time' => $appointment->end_time,
            'total_price' => number_format((float) $appointment->total_price, 2, '.', ''),
            'notes' => $appointment->notes,
            'source' => $appointment->source,
            'status' => $appointment->status,
        ];

        $labels = [
            'client_id' => 'Client',
            'barber_id' => 'Barbier',
            'service_id' => 'Service',
            'appointment_date' => 'Date',
            'start_time' => 'Debut',
            'end_time' => 'Fin',
            'total_price' => 'Prix',
            'notes' => 'Notes',
            'source' => 'Source',
            'status' => 'Statut',
        ];

        $changes = [];

        foreach ($current as $field => $newValue) {
            $oldValue = $original[$field] ?? null;

            if ((string) $oldValue === (string) $newValue) {
                continue;
            }

            $changes[] = sprintf(
                '%s: %s -> %s',
                $labels[$field] ?? $field,
                $this->formatValue($field, $oldValue, $appointment),
                $this->formatValue($field, $newValue, $appointment),
            );
        }

        return $changes;
    }

    private function formatValue(string $field, mixed $value, Appointment $appointment): string
    {
        if ($value === null || $value === '') {
            return '-';
        }

        return match ($field) {
            'client_id' => (string) ($value == $appointment->client_id ? $appointment->client?->full_name : $value),
            'barber_id' => (string) ($value == $appointment->barber_id ? $appointment->barber?->name : $value),
            'service_id' => (string) ($value == $appointment->service_id ? $appointment->service?->name : $value),
            'start_time', 'end_time' => substr((string) $value, 0, 5),
            'total_price' => number_format((float) $value, 2, '.', ''),
            default => (string) $value,
        };
    }
}
