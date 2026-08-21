<?php

use App\Http\Controllers\Api\Admin\AdminSecurityLogsController;
use App\Http\Controllers\Api\Admin\AdminSystemSettingsController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AuditController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\LifecycleController;
use App\Http\Controllers\Api\RoutineController;
use App\Http\Controllers\Api\SkinProfileController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Skincare Scientific Audit REST API - Version 1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // 1. Authentication & Security
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/logout', [AuthController::class, 'logout']);
        });
    });

    // 2. Scientific Formula Audit Engine (Public & Authenticated)
    Route::prefix('audit')->group(function () {
        Route::post('/inci', [AuditController::class, 'auditInci']);
        Route::post('/ocr', [AuditController::class, 'auditOcr']);
        Route::get('/product/{identifier}', [AuditController::class, 'auditProduct']);
        Route::post('/compatibility', [AuditController::class, 'checkCompatibility']);
    });

    // 3. Catalog, Ingredients & SEO Directory (Public)
    Route::prefix('catalog')->group(function () {
        Route::get('/ingredients', [CatalogController::class, 'ingredients']);
        Route::get('/ingredients/{identifier}', [CatalogController::class, 'ingredientDetail']);
        Route::get('/products', [CatalogController::class, 'products']);
        Route::get('/products/{slug}', [CatalogController::class, 'productDetail']);
        Route::get('/brands', [CatalogController::class, 'brands']);
    });

    // 4. Authenticated User Profile, Routines & Lifecycle
    Route::middleware('auth:sanctum')->group(function () {
        // Skin Profile
        Route::get('/profile', [SkinProfileController::class, 'show']);
        Route::post('/profile', [SkinProfileController::class, 'update']);

        // Daily Routine & Adherence Tracking
        Route::prefix('routine')->group(function () {
            Route::get('/today', [RoutineController::class, 'today']);
            Route::post('/items', [RoutineController::class, 'addItem']);
            Route::delete('/items/{id}', [RoutineController::class, 'deleteItem']);
            Route::post('/log', [RoutineController::class, 'logAdherence']);
            Route::get('/stats', [RoutineController::class, 'stats']);
        });

        // Lifecycle, PAO & Replenishment Monitor
        Route::prefix('lifecycle')->group(function () {
            Route::get('/items', [LifecycleController::class, 'items']);
        });
    });

    // 5. Administration, Roles & Security Logs (Admin / Super Admin Only)
    Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin,super_admin'])->group(function () {
        // Users Management
        Route::prefix('users')->group(function () {
            Route::get('/', [AdminUserController::class, 'index']);
            Route::get('/{id}', [AdminUserController::class, 'show']);
            Route::patch('/{id}/role', [AdminUserController::class, 'updateRole']);
            Route::patch('/{id}/toggle-status', [AdminUserController::class, 'toggleStatus']);
            Route::post('/{id}/unlock', [AdminUserController::class, 'unlock']);
        });

        // Security Logs & Audit Trail
        Route::prefix('security')->group(function () {
            Route::get('/logs', [AdminSecurityLogsController::class, 'index']);
            Route::get('/stats', [AdminSecurityLogsController::class, 'stats']);
        });

        // Global System Configuration & Health
        Route::prefix('settings')->group(function () {
            Route::get('/', [AdminSystemSettingsController::class, 'index']);
            Route::post('/', [AdminSystemSettingsController::class, 'update']);
            Route::get('/health', [AdminSystemSettingsController::class, 'systemHealth']);
        });
    });
});
