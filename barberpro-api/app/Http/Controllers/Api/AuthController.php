<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ClientRegisterRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\Client;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => $request->password,
            'role' => 'client',
            'is_active' => true,
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'message' => 'Registered successfully.',
            'user' => $user,
        ], 201);
    }

    public function clientRegister(ClientRegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->full_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => $request->password,
            'role' => 'client',
            'is_active' => true,
        ]);

        $client = Client::create([
            'user_id' => $user->id,
            'salon_id' => $request->salon_id,
            'full_name' => $request->full_name,
            'phone' => $request->phone,
            'email' => $request->email,
            'loyalty_points' => 0,
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'message' => 'Client registered successfully.',
            'user' => $user,
            'client' => $client,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if (!Auth::attempt($request->validated())) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 422);
        }

        $request->session()->regenerate();

        return response()->json([
            'message' => 'Logged in successfully.',
            'user' => $request->user(),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }
}