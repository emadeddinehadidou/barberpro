<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Client\StoreClientRequest;
use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ClientController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Client::with(['preferredBarber'])->latest();

        if ($request->filled('salon_id')) {
            $query->where('salon_id', $request->integer('salon_id'));
        }

        return response()->json($query->get());
    }

    public function store(StoreClientRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('avatar')) {
            $data['avatar'] = $request->file('avatar')->store('avatars/clients', 'public');
        }

        $client = Client::create($data);

        return response()->json($client, 201);
    }

    public function show(Client $client): JsonResponse
    {
        return response()->json($client->load(['preferredBarber', 'appointments']));
    }

    public function update(StoreClientRequest $request, Client $client): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('avatar')) {
            if ($client->avatar) {
                Storage::disk('public')->delete($client->avatar);
            }

            $data['avatar'] = $request->file('avatar')->store('avatars/clients', 'public');
        }

        $client->update($data);

        return response()->json($client);
    }

    public function destroy(Client $client): JsonResponse
    {
        if ($client->avatar) {
            Storage::disk('public')->delete($client->avatar);
        }

        $client->delete();

        return response()->json([
            'message' => 'Client deleted successfully.',
        ]);
    }
}