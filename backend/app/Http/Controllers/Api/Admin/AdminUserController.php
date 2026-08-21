<?php

namespace App\Http\Controllers\Api\Admin;

use App\Domain\Auth\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\SecurityAuditLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::with('skinProfile');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $users = $query->orderBy('id', 'desc')->paginate($request->integer('per_page', 15));

        return response()->json([
            'data' => $users->items(),
            'current_page' => $users->currentPage(),
            'last_page' => $users->lastPage(),
            'total' => $users->total(),
            'per_page' => $users->perPage(),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $user = User::with(['skinProfile', 'routineItems.product.brand'])->findOrFail($id);

        $recentLogs = SecurityAuditLog::where('user_id', $user->id)
            ->orderBy('id', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'user' => $user,
            'security_logs' => $recentLogs,
        ]);
    }

    public function updateRole(Request $request, int $id): JsonResponse
    {
        $targetUser = User::findOrFail($id);
        $currentUser = $request->user();

        $validated = $request->validate([
            'role' => ['required', Rule::enum(UserRole::class)],
        ]);

        $newRole = UserRole::from($validated['role']);
        $oldRole = $targetUser->role;

        // Prevent self-demotion from super_admin if they are the only one
        if ($targetUser->id === $currentUser->id && $oldRole === UserRole::SUPER_ADMIN && $newRole !== UserRole::SUPER_ADMIN) {
            $superAdminsCount = User::where('role', UserRole::SUPER_ADMIN->value)->count();
            if ($superAdminsCount <= 1) {
                return response()->json([
                    'message' => 'No puedes degradar al único Super Administrador del sistema.',
                ], 422);
            }
        }

        $targetUser->role = $newRole;
        $targetUser->save();

        SecurityAuditLog::logEvent(
            'ROLE_CHANGED',
            "Rol modificado para {$targetUser->email} de [{$oldRole?->value}] a [{$newRole->value}] por {$currentUser->email}",
            $currentUser->id,
            'CRITICAL',
            (string) $targetUser->id,
            ['old_role' => $oldRole?->value, 'new_role' => $newRole->value]
        );

        return response()->json([
            'message' => 'Rol actualizado correctamente.',
            'user' => $targetUser->fresh(),
        ]);
    }

    public function toggleStatus(Request $request, int $id): JsonResponse
    {
        $targetUser = User::findOrFail($id);
        $currentUser = $request->user();

        if ($targetUser->id === $currentUser->id) {
            return response()->json([
                'message' => 'No puedes suspender tu propia cuenta.',
            ], 422);
        }

        $targetUser->is_active = !$targetUser->is_active;
        $targetUser->save();

        // If suspending, revoke active tokens
        if (!$targetUser->is_active) {
            $targetUser->tokens()->delete();
        }

        $statusStr = $targetUser->is_active ? 'activada' : 'suspendida';

        SecurityAuditLog::logEvent(
            'USER_STATUS_TOGGLED',
            "Cuenta {$targetUser->email} fue {$statusStr} por {$currentUser->email}",
            $currentUser->id,
            'WARNING',
            (string) $targetUser->id,
            ['is_active' => $targetUser->is_active]
        );

        return response()->json([
            'message' => "La cuenta ha sido {$statusStr} exitosamente.",
            'user' => $targetUser->fresh(),
        ]);
    }

    public function unlock(Request $request, int $id): JsonResponse
    {
        $targetUser = User::findOrFail($id);
        $currentUser = $request->user();

        $targetUser->failed_login_attempts = 0;
        $targetUser->locked_until = null;
        $targetUser->save();

        SecurityAuditLog::logEvent(
            'ACCOUNT_UNLOCKED',
            "Cuenta {$targetUser->email} desbloqueada manualmente por {$currentUser->email}",
            $currentUser->id,
            'INFO',
            (string) $targetUser->id
        );

        return response()->json([
            'message' => 'Cuenta desbloqueada exitosamente.',
            'user' => $targetUser->fresh(),
        ]);
    }
}
