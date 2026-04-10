<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Appointment\StoreAppointmentRequest;
use App\Models\Appointment;
use App\Models\Client;
use App\Services\AppointmentNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    private AppointmentNotificationService $notifications;

    public function __construct(AppointmentNotificationService $notifications)
    {
        $this->notifications = $notifications;
    }

    private function resolveAuthenticatedClient(Request $request): ?Client
    {
        return Client::where('user_id', $request->user()->id)->first();
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Appointment::with(['client', 'barber', 'service']);

        if ($user->hasRole('admin')) {
            // Admin can see all appointments, optionally filtered by salon
            if ($request->filled('salon_id')) {
                $query->where('salon_id', $request->integer('salon_id'));
            }
        } elseif ($user->hasRole('barber')) {
            // Barber can only see their own appointments
            $query->where('barber_id', $user->id);
        } else {
            // Should not reach here due to policy, but just in case
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($request->filled('appointment_date')) {
            $query->whereDate('appointment_date', $request->appointment_date);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->latest()->get());
    }

    public function storeOwn(StoreAppointmentRequest $request): JsonResponse
    {
        $client = $this->resolveAuthenticatedClient($request);

        if (!$client) {
            return response()->json(['message' => 'Client profile not found.'], 404);
        }

        $data = $request->validated();

        $exists = Appointment::where('barber_id', $data['barber_id'])
            ->whereDate('appointment_date', $data['appointment_date'])
            ->where('start_time', '<', $data['end_time'])
            ->where('end_time', '>', $data['start_time'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'This barber already has an appointment in that time slot.',
            ], 422);
        }

        $appointment = Appointment::create([
            ...$data,
            'client_id' => $client->id,
            'salon_id' => $client->salon_id,
            'created_by' => $request->user()->id,
            'status' => 'pending',
            'source' => 'app',
        ]);

        $this->notifications->created($appointment);

        return response()->json($appointment->load(['client', 'barber', 'service']), 201);
    }

    public function store(StoreAppointmentRequest $request): JsonResponse
    {
        $exists = Appointment::where('barber_id', $request->barber_id)
            ->whereDate('appointment_date', $request->appointment_date)
            ->where('start_time', '<', $request->end_time)
            ->where('end_time', '>', $request->start_time)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'This barber already has an appointment in that time slot.',
            ], 422);
        }

        $appointment = Appointment::create([
            ...$request->validated(),
            'created_by' => $request->user()?->id,
            'status' => $request->status ?? 'pending',
            'source' => $request->source ?? 'admin',
        ]);

        $this->notifications->created($appointment);

        return response()->json($appointment->load(['client', 'barber', 'service']), 201);
    }

    public function show(Appointment $appointment): JsonResponse
    {
        $this->authorize('view', $appointment);
        return response()->json($appointment->load(['client', 'barber', 'service']));
    }

    public function update(StoreAppointmentRequest $request, Appointment $appointment): JsonResponse
    {
        $this->authorize('update', $appointment);
        $original = [
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

        $exists = Appointment::where('barber_id', $request->barber_id)
            ->whereDate('appointment_date', $request->appointment_date)
            ->where('id', '!=', $appointment->id)
            ->where('start_time', '<', $request->end_time)
            ->where('end_time', '>', $request->start_time)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'This barber already has an appointment in that time slot.',
            ], 422);
        }

        $appointment->update($request->validated());
        $appointment->forceFill(['reminder_sent_at' => null])->save();
        $this->notifications->updated($appointment, $original);

        return response()->json($appointment->load(['client', 'barber', 'service']));
    }

    public function destroy(Appointment $appointment): JsonResponse
    {
        $this->authorize('delete', $appointment);
        $appointment->delete();

        return response()->json([
            'message' => 'Appointment deleted successfully.',
        ]);
    }

    public function updateOwn(StoreAppointmentRequest $request, Appointment $appointment): JsonResponse
    {
        $client = $this->resolveAuthenticatedClient($request);

        if (!$client) {
            return response()->json(['message' => 'Client profile not found.'], 404);
        }

        if ($appointment->client_id !== $client->id) {
            abort(403);
        }

        $this->authorize('update', $appointment);
        $original = [
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

        $data = $request->validated();

        $exists = Appointment::where('barber_id', $data['barber_id'])
            ->whereDate('appointment_date', $data['appointment_date'])
            ->where('id', '!=', $appointment->id)
            ->where('start_time', '<', $data['end_time'])
            ->where('end_time', '>', $data['start_time'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'This barber already has an appointment in that time slot.',
            ], 422);
        }

        $appointment->update([
            ...$data,
            'client_id' => $client->id,
            'salon_id' => $client->salon_id,
            'status' => $appointment->status,
            'source' => 'app',
        ]);
        $appointment->forceFill(['reminder_sent_at' => null])->save();
        $this->notifications->updated($appointment, $original);

        return response()->json($appointment->load(['client', 'barber', 'service']));
    }

    public function myAppointments(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasRole('client')) {
            $client = Client::where('user_id', $user->id)->first();
            if ($client) {
                $appointments = Appointment::where('client_id', $client->id)
                    ->with(['client', 'barber', 'service'])
                    ->latest()
                    ->get();
            } else {
                $appointments = collect();
            }
        } elseif ($user->hasRole('barber')) {
            // Barber can see their appointments
            $appointments = Appointment::where('barber_id', $user->id)
                ->with(['client', 'barber', 'service'])
                ->latest()
                ->get();
        } else {
            $appointments = collect();
        }

        return response()->json($appointments);
    }

    public function barberAppointments(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->hasRole('barber')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = Appointment::where('barber_id', $user->id)
            ->with(['client', 'barber', 'service']);

        if ($request->filled('appointment_date')) {
            $query->whereDate('appointment_date', $request->appointment_date);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->latest()->get());
    }

    public function updateStatus(Request $request, Appointment $appointment): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,completed,cancelled,absent',
        ]);

        $user = $request->user();

        if ($user->hasRole('client')) {
            abort(403);
        }

        if ($user->hasRole('barber') && $appointment->barber_id !== $user->id) {
            abort(403);
        }

        $oldStatus = $appointment->status;
        $appointment->status = $request->status;
        $appointment->save();
        $this->notifications->statusChanged($appointment, $oldStatus);

        return response()->json($appointment->load(['client', 'barber', 'service']));
    }

    public function cancelOwn(Request $request, Appointment $appointment): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:cancelled',
        ]);

        $user = $request->user();
        $client = Client::where('user_id', $user->id)->first();

        if (!$client || $appointment->client_id !== $client->id) {
            abort(403);
        }

        $this->authorize('update', $appointment);

        if ($appointment->appointment_date->isPast()) {
            return response()->json([
                'message' => 'Past appointments cannot be cancelled.',
            ], 422);
        }

        if (!in_array($appointment->status, ['pending', 'confirmed'], true)) {
            return response()->json([
                'message' => 'Only pending or confirmed appointments can be cancelled.',
            ], 422);
        }

        $oldStatus = $appointment->status;
        $appointment->status = 'cancelled';
        $appointment->save();
        $this->notifications->statusChanged($appointment, $oldStatus);

        return response()->json($appointment->load(['client', 'barber', 'service']));
    }
}
