<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // Salon management
            'view salons',
            'create salons',
            'edit salons',
            'delete salons',

            // User management
            'view users',
            'create users',
            'edit users',
            'delete users',

            // Barber management
            'view barbers',
            'create barbers',
            'edit barbers',
            'delete barbers',

            // Client management
            'view clients',
            'create clients',
            'edit clients',
            'delete clients',

            // Service management
            'view services',
            'create services',
            'edit services',
            'delete services',

            // Appointment management
            'view appointments',
            'create appointments',
            'edit appointments',
            'delete appointments',
            'manage own appointments',

            // Dashboard
            'view dashboard',
            'view reports',

            // Client space
            'book appointments',
            'view own appointments',
            'edit own profile',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions
        $adminRole = Role::create(['name' => 'admin']);
        $adminRole->givePermissionTo(Permission::all());

        $barberRole = Role::create(['name' => 'barber']);
        $barberRole->givePermissionTo([
            'view appointments',
            'edit appointments',
            'manage own appointments',
            'view clients',
            'view services',
            'view dashboard',
        ]);

        $clientRole = Role::create(['name' => 'client']);
        $clientRole->givePermissionTo([
            'book appointments',
            'view own appointments',
            'edit own profile',
        ]);
    }
}