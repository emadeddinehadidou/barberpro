<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Client;
use App\Models\Salon;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);

        $admin = User::create([
            'name' => 'Salon Admin',
            'email' => 'admin@barberpro.test',
            'phone' => '0600000000',
            'password' => 'password',
            'role' => 'admin',
            'is_active' => true,
        ]);
        $admin->assignRole('admin');

        

        $barber = User::create([
            'name' => 'Omar Barber',
            'email' => 'barber@barberpro.test',
            'phone' => '0611111111',
            'password' => 'password',
            'role' => 'barber',
            'is_active' => true,
        ]);
        $barber->assignRole('barber');

        $salon = Salon::create([
            'owner_id' => $admin->id,
            'name' => 'BarberPro Downtown',
            'slug' => 'barberpro-downtown',
            'phone' => '0522000000',
            'email' => 'contact@barberpro.test',
            'address' => 'Downtown street',
            'city' => 'Casablanca',
            'country' => 'Morocco',
            'timezone' => 'Africa/Casablanca',
            'currency' => 'MAD',
        ]);

        $salon->users()->attach([$admin->id, $barber->id]);

        $service1 = Service::create([
            'salon_id' => $salon->id,
            'name' => 'Skin Fade',
            'slug' => 'skin-fade',
            'description' => 'Premium fade haircut.',
            'category' => 'haircut',
            'duration_minutes' => 45,
            'price' => 120,
            'is_active' => true,
        ]);

        $service2 = Service::create([
            'salon_id' => $salon->id,
            'name' => 'Beard Trim',
            'slug' => 'beard-trim',
            'description' => 'Clean beard line and trim.',
            'category' => 'beard',
            'duration_minutes' => 25,
            'price' => 70,
            'is_active' => true,
        ]);

        $client = Client::create([
            'salon_id' => $salon->id,
            'full_name' => 'Yassine Amrani',
            'phone' => '0622222222',
            'email' => 'yassine@test.com',
            'preferred_barber_id' => $barber->id,
            'preferred_style' => 'Skin Fade',
            'loyalty_points' => 10,
        ]);

        Appointment::create([
            'salon_id' => $salon->id,
            'client_id' => $client->id,
            'barber_id' => $barber->id,
            'service_id' => $service1->id,
            'appointment_date' => now()->toDateString(),
            'start_time' => '10:00:00',
            'end_time' => '10:45:00',
            'status' => 'confirmed',
            'total_price' => 120,
            'source' => 'admin',
            'created_by' => $admin->id,
        ]);
    }
}