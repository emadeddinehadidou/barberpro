<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Service\StoreServiceRequest;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ServiceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Service::query();

        if ($user->hasRole('admin')) {
            if ($request->filled('salon_id')) {
                $query->where('salon_id', $request->integer('salon_id'));
            }
        } elseif ($user->hasRole('barber')) {
            $salonIds = $user->salons()->pluck('salons.id');
            $query->whereIn('salon_id', $salonIds);
        } elseif ($user->hasRole('client')) {
            // Clients can only see active services
            $query->where('is_active', true);
        }

        return response()->json($query->latest()->get());
    }

    public function store(StoreServiceRequest $request): JsonResponse
    {
        $service = Service::create([
            ...$request->validated(),
            'slug' => Str::slug($request->name) . '-' . Str::random(5),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return response()->json($service, 201);
    }

    public function show(Service $service): JsonResponse
    {
        $this->authorize('view', $service);
        return response()->json($service);
    }

    public function update(StoreServiceRequest $request, Service $service): JsonResponse
    {
        $this->authorize('update', $service);

        $service->update([
            ...$request->validated(),
            'slug' => Str::slug($request->name) . '-' . Str::random(5),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return response()->json($service);
    }

    public function destroy(Service $service): JsonResponse
    {
        $this->authorize('delete', $service);
        $service->delete();

        return response()->json([
            'message' => 'Service deleted successfully.',
        ]);
    }
}
