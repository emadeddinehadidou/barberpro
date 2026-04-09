<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'salon_id',
        'full_name',
        'phone',
        'email',
        'avatar',
        'birth_date',
        'preferred_barber_id',
        'preferred_style',
        'notes',
        'loyalty_points',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
        ];
    }

    public function salon()
    {
        return $this->belongsTo(Salon::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function preferredBarber()
    {
        return $this->belongsTo(User::class, 'preferred_barber_id');
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }
}