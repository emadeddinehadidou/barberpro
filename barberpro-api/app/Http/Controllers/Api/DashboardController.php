<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Client;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function overview(Request $request): JsonResponse
    {
        $salonId = $request->integer('salon_id', 1);
        $today = now()->toDateString();

        // Stats principales
        $appointmentsToday = Appointment::where('salon_id', $salonId)
            ->whereDate('appointment_date', $today)
            ->count();

        $revenueToday = Appointment::where('salon_id', $salonId)
            ->whereDate('appointment_date', $today)
            ->whereIn('status', ['confirmed', 'completed'])
            ->sum('total_price');

        $clientsCount = Client::where('salon_id', $salonId)->count();
        $servicesCount = Service::where('salon_id', $salonId)->where('is_active', true)->count();

        // Données récentes
        $recentAppointments = Appointment::with(['client', 'barber', 'service'])
            ->where('salon_id', $salonId)
            ->latest()
            ->take(5)
            ->get();

        $recentClients = Client::where('salon_id', $salonId)
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'appointments_today' => $appointmentsToday,
            'revenue_today' => (float) $revenueToday,
            'clients_count' => $clientsCount,
            'services_count' => $servicesCount,
            'recent_appointments' => $recentAppointments,
            'recent_clients' => $recentClients,
        ]);
    }

    public function stats(Request $request): JsonResponse
    {
        $salonId = $request->integer('salon_id', 1);

        $data = Appointment::selectRaw('DATE(appointment_date) as date, SUM(total_price) as revenue, COUNT(*) as count')
            ->where('salon_id', $salonId)
            ->whereDate('appointment_date', '>=', now()->subDays(7))
            ->whereIn('status', ['confirmed', 'completed'])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'revenue' => (float) $item->revenue,
                    'count' => (int) $item->count,
                ];
            });

        return response()->json($data);
    }

    public function admin(Request $request): JsonResponse
    {
        $salonId = $request->integer('salon_id', 1);
        $today = now()->toDateString();

        // Basic stats
        $totalClients = Client::where('salon_id', $salonId)->count();
        $totalServices = Service::where('salon_id', $salonId)->where('is_active', true)->count();
        $appointmentsToday = Appointment::where('salon_id', $salonId)
            ->whereDate('appointment_date', $today)
            ->count();
        $revenueToday = Appointment::where('salon_id', $salonId)
            ->whereDate('appointment_date', $today)
            ->whereIn('status', ['confirmed', 'completed'])
            ->sum('total_price');

        // Charts data - Last 7 days
        $appointmentsLast7Days = Appointment::selectRaw('DATE(appointment_date) as date, COUNT(*) as count')
            ->where('salon_id', $salonId)
            ->whereDate('appointment_date', '>=', now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn($item) => [
                'date' => $item->date,
                'count' => (int) $item->count,
            ]);

        $revenueLast7Days = Appointment::selectRaw('DATE(appointment_date) as date, SUM(total_price) as total')
            ->where('salon_id', $salonId)
            ->whereDate('appointment_date', '>=', now()->subDays(7))
            ->whereIn('status', ['confirmed', 'completed'])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn($item) => [
                'date' => $item->date,
                'total' => (float) $item->total,
            ]);

        // Recent data
        $recentAppointments = Appointment::with(['client', 'barber', 'service'])
            ->where('salon_id', $salonId)
            ->latest()
            ->take(5)
            ->get();

        $recentClients = Client::where('salon_id', $salonId)
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'total_clients' => $totalClients,
            'total_services' => $totalServices,
            'appointments_today' => $appointmentsToday,
            'revenue_today' => (float) $revenueToday,
            'appointments_last_7_days' => $appointmentsLast7Days,
            'revenue_last_7_days' => $revenueLast7Days,
            'recent_appointments' => $recentAppointments,
            'recent_clients' => $recentClients,
        ]);
    }

    public function barber(Request $request): JsonResponse
    {
        $user = $request->user();
        $today = now()->toDateString();
        $weekStart = now()->startOfWeek()->toDateString();
        $weekEnd = now()->endOfWeek()->toDateString();

        // Personal stats
        $appointmentsToday = Appointment::where('barber_id', $user->id)
            ->whereDate('appointment_date', $today)
            ->count();

        $completedToday = Appointment::where('barber_id', $user->id)
            ->whereDate('appointment_date', $today)
            ->where('status', 'completed')
            ->count();

        $upcomingAppointments = Appointment::where('barber_id', $user->id)
            ->whereDate('appointment_date', '>=', $today)
            ->where('status', 'confirmed')
            ->count();

        $revenueToday = Appointment::where('barber_id', $user->id)
            ->whereDate('appointment_date', $today)
            ->where('status', 'completed')
            ->sum('total_price');

        $cancelledToday = Appointment::where('barber_id', $user->id)
            ->whereDate('appointment_date', $today)
            ->where('status', 'cancelled')
            ->count();

        // Today's appointments
        $todayAppointments = Appointment::with(['client', 'service'])
            ->where('barber_id', $user->id)
            ->whereDate('appointment_date', $today)
            ->orderBy('start_time')
            ->get();

        // Upcoming appointments
        $upcoming = Appointment::with(['client', 'service'])
            ->where('barber_id', $user->id)
            ->whereDate('appointment_date', '>', $today)
            ->where('status', 'confirmed')
            ->orderBy('appointment_date')
            ->orderBy('start_time')
            ->take(10)
            ->get();

        // Weekly performance
        $weeklyCompleted = Appointment::where('barber_id', $user->id)
            ->whereBetween('appointment_date', [$weekStart, $weekEnd])
            ->where('status', 'completed')
            ->count();

        $weeklyRevenue = Appointment::where('barber_id', $user->id)
            ->whereBetween('appointment_date', [$weekStart, $weekEnd])
            ->where('status', 'completed')
            ->sum('total_price');

        // Most requested services this week
        $topServices = Appointment::select('services.name', DB::raw('COUNT(*) as count'))
            ->join('services', 'appointments.service_id', '=', 'services.id')
            ->where('appointments.barber_id', $user->id)
            ->whereBetween('appointment_date', [$weekStart, $weekEnd])
            ->groupBy('services.id', 'services.name')
            ->orderBy('count', 'desc')
            ->take(3)
            ->get();

        // Client return rate (simplified)
        $totalClients = Appointment::where('barber_id', $user->id)
            ->distinct('client_id')
            ->count();

        $returningClients = DB::table('appointments')
            ->select('client_id')
            ->where('barber_id', $user->id)
            ->groupBy('client_id')
            ->havingRaw('COUNT(*) > 1')
            ->count();

        $returnRate = $totalClients > 0 ? round(($returningClients / $totalClients) * 100, 1) : 0;

        return response()->json([
            'stats' => [
                'appointments_today' => $appointmentsToday,
                'completed_today' => $completedToday,
                'upcoming_appointments' => $upcomingAppointments,
                'revenue_today' => (float) $revenueToday,
                'cancelled_today' => $cancelledToday,
            ],
            'today_appointments' => $todayAppointments,
            'upcoming_appointments' => $upcoming,
            'weekly_performance' => [
                'completed' => $weeklyCompleted,
                'revenue' => (float) $weeklyRevenue,
                'top_services' => $topServices,
                'client_return_rate' => $returnRate,
            ],
        ]);
    }

    public function client(Request $request): JsonResponse
    {
        $user = $request->user();
        $client = Client::where('user_id', $user->id)->first();

        if (!$client) {
            return response()->json([
                'next_appointment' => null,
                'total_visits' => 0,
                'loyalty_points' => 0,
                'favorite_service' => null,
                'upcoming_appointments' => [],
                'appointment_history' => [],
                'profile' => [
                    'full_name' => $user->name,
                    'phone' => $user->phone ?? '',
                    'email' => $user->email,
                    'avatar' => $user->avatar ?? null,
                    'birth_date' => null,
                    'preferred_style' => null,
                ],
            ]);
        }

        // Next appointment
        $nextAppointment = Appointment::with(['barber', 'service'])
            ->where('client_id', $client->id)
            ->whereDate('appointment_date', '>=', now()->toDateString())
            ->whereIn('status', ['pending', 'confirmed'])
            ->orderBy('appointment_date')
            ->orderBy('start_time')
            ->first();

        // Total visits
        $totalVisits = Appointment::where('client_id', $client->id)
            ->where('status', 'completed')
            ->count();

        // Loyalty points (simplified - 1 point per completed appointment)
        $loyaltyPoints = $totalVisits;

        // Favorite service
        $favoriteService = Appointment::select('services.name', DB::raw('COUNT(*) as count'))
            ->join('services', 'appointments.service_id', '=', 'services.id')
            ->where('appointments.client_id', $client->id)
            ->where('appointments.status', 'completed')
            ->groupBy('services.id', 'services.name')
            ->orderBy('count', 'desc')
            ->first();

        // Upcoming appointments
        $upcomingAppointments = Appointment::with(['barber', 'service'])
            ->where('client_id', $client->id)
            ->whereDate('appointment_date', '>=', now()->toDateString())
            ->whereIn('status', ['pending', 'confirmed'])
            ->orderBy('appointment_date')
            ->orderBy('start_time')
            ->get();

        // Appointment history
        $appointmentHistory = Appointment::with(['barber', 'service'])
            ->where('client_id', $client->id)
            ->whereIn('status', ['completed', 'cancelled', 'absent'])
            ->orderBy('appointment_date', 'desc')
            ->take(10)
            ->get();

        // Profile summary
        $profile = [
            'full_name' => $client->full_name,
            'phone' => $client->phone ?? '',
            'email' => $user->email,
            'avatar' => $client->avatar ? asset('storage/' . $client->avatar) : null,
            'birth_date' => $client->birth_date,
            'preferred_style' => $client->preferred_style,
        ];

        return response()->json([
            'next_appointment' => $nextAppointment,
            'total_visits' => $totalVisits,
            'loyalty_points' => $loyaltyPoints,
            'favorite_service' => $favoriteService,
            'upcoming_appointments' => $upcomingAppointments,
            'appointment_history' => $appointmentHistory,
            'profile' => $profile,
        ]);
    }
}
