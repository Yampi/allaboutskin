<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SecurityAuditLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSecurityLogsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = SecurityAuditLog::with('user:id,name,email,role');

        if ($request->filled('severity')) {
            $query->where('severity', $request->severity);
        }

        if ($request->filled('event_type')) {
            $query->where('event_type', $request->event_type);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%")
                  ->orWhere('resource_target', 'like', "%{$search}%");
            });
        }

        $logs = $query->orderBy('id', 'desc')->paginate($request->integer('per_page', 25));

        return response()->json([
            'data' => $logs->items(),
            'current_page' => $logs->currentPage(),
            'last_page' => $logs->lastPage(),
            'total' => $logs->total(),
            'per_page' => $logs->perPage(),
        ]);
    }

    public function stats(): JsonResponse
    {
        $last24h = now()->subHours(24);

        $stats = [
            'failed_logins_24h' => SecurityAuditLog::where('event_type', 'LOGIN_FAILED')
                ->where('created_at', '>=', $last24h)
                ->count(),
            'throttled_requests_24h' => SecurityAuditLog::whereIn('event_type', ['LOGIN_THROTTLED', 'ACCOUNT_LOCKED', 'SUSPICIOUS_REQUEST'])
                ->where('created_at', '>=', $last24h)
                ->count(),
            'critical_events_count' => SecurityAuditLog::where('severity', 'CRITICAL')->count(),
            'total_admins_count' => User::whereIn('role', ['admin', 'super_admin'])->count(),
            'locked_users_count' => User::where('locked_until', '>', now())->count(),
        ];

        return response()->json([
            'stats' => $stats,
        ]);
    }
}
