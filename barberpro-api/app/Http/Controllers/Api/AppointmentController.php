<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Appointment\StoreAppointmentRequest;
use App\Models\Appointment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Appointment::with(['client', 'barber', 'service'])->latest();

        if ($request->filled('salon_id')) {
            $query->where('salon_id', $request->integer('salon_id'));
        }

        if ($request->filled('appointment_date')) {
            $query->whereDate('appointment_date', $request->appointment_date);
        }

        return response()->json($query->get());
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

        return response()->json($appointment->load(['client', 'barber', 'service']), 201);
    }

    public function show(Appointment $appointment): JsonResponse
    {
        return response()->json($appointment->load(['client', 'barber', 'service']));
    }

    public function update(StoreAppointmentRequest $request, Appointment $appointment): JsonResponse
    {
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

        return response()->json($appointment->load(['client', 'barber', 'service']));
    }

    public function destroy(Appointment $appointment): JsonResponse
    {
        $appointment->delete();

        return response()->json([
            'message' => 'Appointment deleted successfully.',
        ]);
    }
}