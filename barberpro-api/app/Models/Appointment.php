<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'salon_id',
        'client_id',
        'barber_id',
        'service_id',
        'appointment_date',
        'start_time',
        'end_time',
        'status',
        'total_price',
        'notes',
        'source',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'appointment_date' => 'date',
            'total_price' => 'decimal:2',
        ];
    }

    public function salon()
    {
        return $this->belongsTo(Salon::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function barber()
    {
        return $this->belongsTo(User::class, 'barber_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}