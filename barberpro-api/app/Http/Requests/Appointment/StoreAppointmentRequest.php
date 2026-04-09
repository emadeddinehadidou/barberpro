<?php

namespace App\Http\Requests\Appointment;

use Illuminate\Foundation\Http\FormRequest;

class StoreAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'salon_id' => ['required', 'exists:salons,id'],
            'client_id' => ['required', 'exists:clients,id'],
            'barber_id' => ['required', 'exists:users,id'],
            'service_id' => ['required', 'exists:services,id'],
            'appointment_date' => ['required', 'date'],
            'start_time' => ['required'],
            'end_time' => ['required'],
            'status' => ['nullable', 'in:pending,confirmed,completed,cancelled,no_show'],
            'total_price' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'source' => ['nullable', 'in:app,walk_in,phone,admin'],
        ];
    }
}