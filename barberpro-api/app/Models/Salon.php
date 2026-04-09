<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Salon extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'name',
        'slug',
        'phone',
        'email',
        'address',
        'city',
        'country',
        'logo',
        'cover_image',
        'timezone',
        'currency',
        'opening_hours_json',
    ];

    protected function casts(): array
    {
        return [
            'opening_hours_json' => 'array',
        ];
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function users()
    {
        return $this->belongsToMany(User::class)->withTimestamps();
    }

    public function services()
    {
        return $this->hasMany(Service::class);
    }

    public function clients()
    {
        return $this->hasMany(Client::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }
}