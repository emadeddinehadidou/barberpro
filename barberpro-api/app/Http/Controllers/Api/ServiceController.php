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
        $query = Service::query()->latest();

        if ($request->filled('salon_id')) {
            $query->where('salon_id', $request->integer('salon_id'));
        }

        return response()->json($query->get());
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
        return response()->json($service);
    }

    public function update(StoreServiceRequest $request, Service $service): JsonResponse
    {
        $service->update([
            ...$request->validated(),
            'slug' => Str::slug($request->name) . '-' . Str::random(5),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return response()->json($service);
    }

    public function destroy(Service $service): JsonResponse
    {
        $service->delete();

        return response()->json([
            'message' => 'Service deleted successfully.',
        ]);
    }
}