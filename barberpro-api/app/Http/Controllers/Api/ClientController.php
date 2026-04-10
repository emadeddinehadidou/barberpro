<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Client\StoreClientRequest;
use App\Http\Requests\Client\UpdateClientRequest;
use App\Models\Client;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ClientController extends Controller
{
    private function serializeClient(Client $client): array
    {
        $client->loadMissing('user');

        return [
            'id' => $client->id,
            'user_id' => $client->user_id,
            'salon_id' => $client->salon_id,
            'full_name' => $client->full_name,
            'phone' => $client->phone,
            'email' => $client->user ? $client->user->email : $client->email,
            'birth_date' => $client->birth_date,
            'preferred_barber_id' => $client->preferred_barber_id,
            'preferred_style' => $client->preferred_style,
            'notes' => $client->notes,
            'loyalty_points' => $client->loyalty_points,
            'avatar' => $client->avatar ? asset('storage/' . $client->avatar) : null,
            'avatar_url' => $client->avatar ? asset('storage/' . $client->avatar) : null,
            'created_at' => $client->created_at,
            'updated_at' => $client->updated_at,
        ];
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Client::with(['preferredBarber']);

        if ($user->hasRole('admin')) {
            // Admin can see all clients, optionally filtered by salon
            if ($request->filled('salon_id')) {
                $query->where('salon_id', $request->integer('salon_id'));
            }
        } elseif ($user->hasRole('barber')) {
            // Barber can only see clients from salons they work in
            $salonIds = $user->salons()->pluck('salons.id');
            $query->whereIn('salon_id', $salonIds);
        } else {
            // Should not reach here due to policy
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(
            $query
                ->latest()
                ->get()
                ->map(fn (Client $client) => $this->serializeClient($client))
                ->values()
        );
    }

    public function store(StoreClientRequest $request): JsonResponse
    {
        // Ensure only admin can create clients
        if (!$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized. Only admin can create clients.'], 403);
        }

        $data = $request->validated();

        return DB::transaction(function () use ($data, $request) {
            // Create user first
            $user = User::create([
                'name' => $data['full_name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'phone' => $data['phone'],
                'role' => 'client',
                'is_active' => true,
            ]);

            // Assign client role
            $user->assignRole('client');

            // Handle avatar upload if provided
            $avatarPath = null;
            if ($request->hasFile('avatar')) {
                $avatarPath = $request->file('avatar')->store('avatars/clients', 'public');
            }

            // Create client record linked to user
            $client = Client::create([
                'user_id' => $user->id,
                'salon_id' => $data['salon_id'],
                'full_name' => $data['full_name'],
                'phone' => $data['phone'],
                'email' => $data['email'], // Keep for backward compatibility, but should come from user
                'avatar' => $avatarPath,
                'birth_date' => $data['birth_date'] ?? null,
                'preferred_barber_id' => $data['preferred_barber_id'] ?? null,
                'preferred_style' => $data['preferred_style'] ?? null,
                'notes' => $data['notes'] ?? null,
                'loyalty_points' => 0,
            ]);

            // Return client with user relationship (but exclude password)
            return response()->json($this->serializeClient($client), 201);
        });
    }

    public function show(Client $client): JsonResponse
    {
        $this->authorize('view', $client);

        // Load the linked user to get the email
        return response()->json($this->serializeClient($client));
    }

    public function update(UpdateClientRequest $request, Client $client): JsonResponse
    {
        $this->authorize('update', $client);

        $data = $request->validated();

        return DB::transaction(function () use ($data, $request, $client) {
            // Update the linked user
            $user = $client->user;
            if ($user) {
                $userData = [
                    'name' => $data['full_name'],
                    'email' => $data['email'],
                    'phone' => $data['phone'],
                ];

                // Only update password if provided
                if (!empty($data['password'])) {
                    $userData['password'] = Hash::make($data['password']);
                }

                $user->update($userData);
            }

            // Handle avatar upload if provided
            if ($request->hasFile('avatar')) {
                if ($client->avatar) {
                    Storage::disk('public')->delete($client->avatar);
                }
                $data['avatar'] = $request->file('avatar')->store('avatars/clients', 'public');
            }

            // Update client record
            $client->update([
                'full_name' => $data['full_name'],
                'phone' => $data['phone'],
                'email' => $data['email'],
                'avatar' => $data['avatar'] ?? $client->avatar,
                'birth_date' => $data['birth_date'] ?? null,
                'preferred_barber_id' => $data['preferred_barber_id'] ?? null,
                'preferred_style' => $data['preferred_style'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            return response()->json($this->serializeClient($client));
        });
    }

    public function destroy(Client $client): JsonResponse
    {
        $this->authorize('delete', $client);

        DB::transaction(function () use ($client) {
            if ($client->avatar) {
                Storage::disk('public')->delete($client->avatar);
            }

            $user = $client->user;
            $client->delete();

            if ($user) {
                $user->delete();
            }
        });

        return response()->json([
            'message' => 'Client deleted successfully.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $client = Client::with('user')
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$client) {
            return response()->json(['message' => 'Client profile not found.'], 404);
        }

        return response()->json($this->serializeClient($client));
    }

    public function updateOwnAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $client = Client::where('user_id', $request->user()->id)->first();

        if (!$client) {
            return response()->json(['message' => 'Client profile not found.'], 404);
        }

        if ($client->avatar) {
            Storage::disk('public')->delete($client->avatar);
        }

        $path = $request->file('avatar')->store('avatars/clients', 'public');

        $client->update(['avatar' => $path]);

        return response()->json($this->serializeClient($client));
    }
}
