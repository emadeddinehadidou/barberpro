<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
 public function overview(Request $request): JsonResponse
    {
        $salonId = $request->integer('salon_id');
        $today = now()->toDateString();

        $appointmentsToday = Appointment::where('salon_id', $salonId)
            ->whereDate('appointment_date', $today)
            ->count();

        $revenueToday = Appointment::where('salon_id', $salonId)
            ->whereDate('appointment_date', $today)
            ->whereIn('status', ['confirmed', 'completed'])
            ->sum('total_price');

        $clientsCount = Client::where('salon_id', $salonId)->count();
        $servicesCount = Service::where('salon_id', $salonId)->count();

        return response()->json([
            'appointments_today' => $appointmentsToday,
            'revenue_today' => $revenueToday,
            'clients_count' => $clientsCount,
            'services_count' => $servicesCount,
        ]);
    }
    public function stats(Request $request): JsonResponse
    {
        $salonId = $request->integer('salon_id');

        $data = \App\Models\Appointment::selectRaw('DATE(appointment_date) as date, SUM(total_price) as revenue, COUNT(*) as count')
            ->where('salon_id', $salonId)
            ->whereDate('appointment_date', '>=', now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json($data);
    }
}
