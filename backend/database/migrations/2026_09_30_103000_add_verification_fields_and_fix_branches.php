<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Agregar campos de auditoría geográfica y verificación a store_branches
        Schema::table('store_branches', function (Blueprint $table) {
            $table->boolean('is_verified')->default(false)->after('is_active');
            $table->string('verification_source', 50)->nullable()->after('is_verified'); // 'OPENSTREETMAP', 'GOOGLE_PLACES', 'MANUAL_AUDIT', 'OFFICIAL_CHAIN_API'
            $table->string('external_place_id', 150)->nullable()->after('verification_source');
            $table->timestamp('last_verified_at')->nullable()->after('external_place_id');

            $table->index(['is_verified', 'is_active'], 'idx_branches_verified_active');
        });

        // 2. Eliminar la sucursal fantasma de Locatel en Valle de la Pascua (no existe físicamente)
        DB::table('store_branches')
            ->where(function ($query) {
                $query->where('name', 'ILIKE', '%Locatel%Valle de la Pascua%')
                      ->orWhere('slug', 'ILIKE', '%locatel%valle-de-la-pascua%');
            })
            ->where('city', 'ILIKE', 'Valle de la Pascua')
            ->delete();

        // 3. Corregir datos reales de Farmatodo Valle de la Pascua (Av. Las Industrias con Av. Libertador)
        DB::table('store_branches')
            ->where(function ($query) {
                $query->where('name', 'ILIKE', '%Farmatodo%')
                      ->where('city', 'ILIKE', 'Valle de la Pascua');
            })
            ->update([
                'name' => 'Farmatodo - Av. Las Industrias',
                'slug' => 'farmatodo-av-las-industrias-valle-de-la-pascua',
                'address' => 'Av. Las Industrias cruce con Av. Libertador, Sector Las Garcitas',
                'reference_point' => 'Entrada por la Av. Libertador hacia la Redoma',
                'latitude' => 9.2158000,
                'longitude' => -66.0125000,
                'phone' => '+58 238-7621122',
                'whatsapp' => '+58 412-3276286',
                'opening_hours' => '24 Horas / Todos los días',
                'geofence_radius_meters' => 100,
                'is_active' => true,
                'is_verified' => true,
                'verification_source' => 'MANUAL_AUDIT',
                'last_verified_at' => now(),
            ]);

        // 4. Marcar las sucursales existentes legítimas con verificación inicial
        DB::table('store_branches')
            ->whereIn('slug', [
                'farmatodo-av-las-delicias-maracay',
                'farmatodo-las-mercedes-caracas',
                'locatel-boleita-norte-caracas',
                'rio-supermercado-traki-valle-de-la-pascua',
                'farmacia-saas-av-romulo-gallegos-valle-de-la-pascua',
                'farmahorro-av-libertador-valle-de-la-pascua'
            ])
            ->update([
                'is_verified' => true,
                'verification_source' => 'MANUAL_AUDIT',
                'last_verified_at' => now(),
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('store_branches', function (Blueprint $table) {
            $table->dropIndex('idx_branches_verified_active');
            $table->dropColumn([
                'is_verified',
                'verification_source',
                'external_place_id',
                'last_verified_at',
            ]);
        });
    }
};
