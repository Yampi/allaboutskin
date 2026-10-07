<?php

use App\Http\Controllers\Api\Admin\AdminNotificationController;
use App\Http\Controllers\Api\Admin\AdminScraperController;
use App\Http\Controllers\Api\Admin\AdminSecurityLogsController;
use App\Http\Controllers\Api\Admin\AdminStoreController;
use App\Http\Controllers\Api\Admin\AdminSystemSettingsController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AuditController;
use App\Http\Controllers\Api\SocialAuthController;
use App\Http\Controllers\Api\Business\BusinessAnalyticsController;
use App\Http\Controllers\Api\Business\BusinessBranchController;
use App\Http\Controllers\Api\Business\BusinessOfferController;
use App\Http\Controllers\Api\Business\BusinessStoreController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\LifecycleController;
use App\Http\Controllers\Api\RoutineController;
use App\Http\Controllers\Api\SkinProfileController;
use App\Http\Controllers\Api\StoreDirectoryController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Skincare Scientific Audit REST API - Version 1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // 0. Public Health & Node Connectivity Monitor
    Route::get('/health', function () {
        $dbStatus = 'error';
        $datasetStatus = 'unavailable';
        try {
            \Illuminate\Support\Facades\DB::connection()->getPdo();
            $dbStatus = 'connected';
            $datasetStatus = \App\Models\Ingredient::query()->exists() ? 'loaded' : 'empty';
        } catch (\Throwable $e) {
            // Se reporta solo el estado; nunca el detalle del error.
        }

        $isHealthy = $dbStatus === 'connected' && $datasetStatus === 'loaded';

        return response()->json([
            'status' => $isHealthy ? 'operational' : 'degraded',
            'uptime_status' => 'online',
            'timestamp' => now()->toIso8601String(),
            'services' => [
                'database' => $dbStatus,
                'ingredient_dataset' => $datasetStatus,
            ],
        ], $isHealthy ? 200 : 503);
    });

    // 1. Authentication & Security
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);

        // Social Authentication (Laravel Socialite: Google, Facebook, etc.)
        Route::get('/{provider}/redirect', [SocialAuthController::class, 'redirectToProvider']);
        Route::get('/{provider}/callback', [SocialAuthController::class, 'handleProviderCallback']);

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

    // 3.5. Local Stores, Branches & In-Store Shopping (Public)
    Route::prefix('stores')->group(function () {
        Route::get('/', [StoreDirectoryController::class, 'index']);
        Route::get('/search-products', [StoreDirectoryController::class, 'searchProductsGeolocated']);
        Route::get('/nearby', [StoreDirectoryController::class, 'nearby']);
        Route::get('/cities', [StoreDirectoryController::class, 'cities']);
        Route::get('/optimize-routine', [StoreDirectoryController::class, 'optimizeRoutine']);
        Route::get('/branches/{identifier}/products', [StoreDirectoryController::class, 'branchProducts']);
        Route::post('/suggest', [StoreDirectoryController::class, 'suggest']);
        Route::post('/interactions', [StoreDirectoryController::class, 'recordInteraction']);
        Route::get('/{identifier}', [StoreDirectoryController::class, 'show']);
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

    // 4.5. Business Portal & Merchant Store Management
    Route::prefix('business')->middleware('auth:sanctum')->group(function () {
        // Registro o reclamo de tienda comercial (disponible para cualquier usuario autenticado)
        Route::post('/store/register', [BusinessStoreController::class, 'register']);
        Route::post('/store/claim', [BusinessStoreController::class, 'claim']);

        // Rutas protegidas para dueños de comercio y administradores
        Route::middleware('role:business_owner,admin,super_admin')->group(function () {
            // Perfil de la tienda
            Route::get('/store', [BusinessStoreController::class, 'show']);
            Route::put('/store', [BusinessStoreController::class, 'update']);

            // Gestión de Sucursales
            Route::prefix('branches')->group(function () {
                Route::get('/', [BusinessBranchController::class, 'index']);
                Route::post('/', [BusinessBranchController::class, 'store']);
                Route::get('/{id}', [BusinessBranchController::class, 'show']);
                Route::put('/{id}', [BusinessBranchController::class, 'update']);
                Route::delete('/{id}', [BusinessBranchController::class, 'destroy']);
            });

            // Gestión de Ofertas e Inventario
            Route::prefix('offers')->group(function () {
                Route::get('/', [BusinessOfferController::class, 'index']);
                Route::post('/', [BusinessOfferController::class, 'store']);
                Route::post('/import', [BusinessOfferController::class, 'importCatalog']);
                Route::put('/{id}', [BusinessOfferController::class, 'update']);
                Route::delete('/{id}', [BusinessOfferController::class, 'destroy']);
                Route::post('/bulk-update', [BusinessOfferController::class, 'bulkUpdatePrices']);
            });

            // Analíticas de Rendimiento y Leads
            Route::get('/analytics', [BusinessAnalyticsController::class, 'summary']);
        });
    });

    // 5. Administration, Roles & Security Logs (Admin / Super Admin Only)
    Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin,super_admin'])->group(function () {
        // Notification & Flash Summary
        Route::get('/notifications/summary', [AdminNotificationController::class, 'summary']);

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

        // Stores & Directory Supervision
        Route::prefix('stores')->group(function () {
            Route::get('/', [AdminStoreController::class, 'index']);
            Route::get('/{id}', [AdminStoreController::class, 'show']);
            Route::patch('/{id}/verification', [AdminStoreController::class, 'updateVerification']);
            Route::patch('/{id}/subscription', [AdminStoreController::class, 'updateSubscription']);
            Route::patch('/{id}/toggle-status', [AdminStoreController::class, 'toggleStatus']);
            Route::patch('/{id}/quick-update', [AdminStoreController::class, 'quickUpdate']);
            Route::delete('/{id}', [AdminStoreController::class, 'destroy']);
        });

        // Scraper & Crawler Control
        Route::prefix('scraper')->group(function () {
            Route::get('/status', [AdminScraperController::class, 'status']);
            Route::get('/summary', [AdminScraperController::class, 'summary']);
            Route::post('/run', [AdminScraperController::class, 'run']);
            Route::post('/parse-social-post', [AdminScraperController::class, 'parseSocialPost']);
            Route::post('/detect-platform', [AdminScraperController::class, 'detectPlatform']);
            Route::post('/discover-web', [AdminScraperController::class, 'discoverWeb']);
        });
    });
});
