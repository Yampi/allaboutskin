<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AffiliateStore;
use App\Models\SecurityAuditLog;
use App\Models\StoreLeadInteraction;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminNotificationController extends Controller
{
    /**
     * Resumen de alertas, contadores de acción pendiente y mensajes flash para el panel admin.
     */
    public function summary(Request $request): JsonResponse
    {
        $startOfDay = now()->startOfDay();

        // 1. Tiendas pendientes de aprobación
        $pendingStores = AffiliateStore::query()
            ->with(['branches:id,store_id,city,state', 'owner:id,name,email'])
            ->where('verification_status', 'PENDING_REVIEW')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get(['id', 'name', 'country_code', 'whatsapp_contact', 'created_at', 'owner_id']);

        $pendingStoresCount = AffiliateStore::where('verification_status', 'PENDING_REVIEW')->count();

        // 2. Nuevos usuarios de hoy
        $todayNewUsersCount = User::where('created_at', '>=', $startOfDay)->count();
        $totalUsersCount = User::count();

        // 3. Leads y clics generados hoy hacia comercios
        $todayLeadsCount = StoreLeadInteraction::where('created_at', '>=', $startOfDay)->count();

        // 4. Incidentes en logs de auditoría
        $securityAlertsCount = SecurityAuditLog::where('created_at', '>=', $startOfDay)
            ->whereIn('severity', ['HIGH', 'CRITICAL'])
            ->count();

        // 5. Mensajes Flash Dinámicos
        $flashMessages = [];
        if ($pendingStoresCount > 0) {
            $storeNames = $pendingStores->pluck('name')->take(2)->implode(', ');
            $suffix = $pendingStoresCount > 2 ? ' y ' . ($pendingStoresCount - 2) . ' más' : '';
            $flashMessages[] = [
                'type' => 'warning',
                'title' => 'Tiendas esperando validación',
                'message' => "Hay {$pendingStoresCount} tienda(s) pendiente(s) de revisión ({$storeNames}{$suffix}). Valídalas para habilitar su visibilidad en el mapa local.",
                'action_label' => 'Revisar Tiendas',
                'action_tab' => 'stores',
            ];
        }

        return response()->json([
            'status' => 'success',
            'pending_stores_count' => $pendingStoresCount,
            'recent_pending_stores' => $pendingStores,
            'today_users_count' => $todayNewUsersCount,
            'total_users_count' => $totalUsersCount,
            'today_leads_count' => $todayLeadsCount,
            'security_alerts_count' => $securityAlertsCount,
            'flash_messages' => $flashMessages,
        ]);
    }
}
