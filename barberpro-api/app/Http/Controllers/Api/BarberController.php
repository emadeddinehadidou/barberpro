<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Barber\StoreBarberRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BarberController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::where('role', 'barber')->latest();

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        return response()->json(
            $query->get(['id', 'name', 'email', 'phone', 'avatar', 'role', 'is_active', 'created_at'])
        );
    }

    public function store(StoreBarberRequest $request): JsonResponse
    {
        $avatarPath = null;

        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars/barbers', 'public');
        }

        $barber = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'avatar' => $avatarPath,
            'password' => $request->password,
            'role' => 'barber',
            'is_active' => $request->boolean('is_active', true),
        ]);

        $barber->assignRole('barber');

        return response()->json($barber, 201);
    }

    public function show(User $barber): JsonResponse
    {
        if ($barber->role !== 'barber') {
            return response()->json(['message' => 'Barber not found.'], 404);
        }

        return response()->json($barber);
    }

    public function update(StoreBarberRequest $request, User $barber): JsonResponse
    {
        if ($barber->role !== 'barber') {
            return response()->json(['message' => 'Barber not found.'], 404);
        }

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'is_active' => $request->boolean('is_active', true),
        ];

        if ($request->hasFile('avatar')) {
            if ($barber->avatar) {
                Storage::disk('public')->delete($barber->avatar);
            }

            $data['avatar'] = $request->file('avatar')->store('avatars/barbers', 'public');
        }

        if ($request->filled('password')) {
            $data['password'] = $request->password;
        }

        $barber->update($data);
        $barber->syncRoles(['barber']);

        return response()->json($barber);
    }

    public function destroy(User $barber): JsonResponse
    {
        if ($barber->role !== 'barber') {
            return response()->json(['message' => 'Barber not found.'], 404);
        }

        if ($barber->avatar) {
            Storage::disk('public')->delete($barber->avatar);
        }

        $barber->delete();

        return response()->json([
            'message' => 'Barber deleted successfully.',
        ]);
    }
}
