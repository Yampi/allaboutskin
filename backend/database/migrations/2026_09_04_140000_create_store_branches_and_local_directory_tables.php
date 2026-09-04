<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Ampliar affiliate_stores con atributos para tiendas locales e independientes
        Schema::table('affiliate_stores', function (Blueprint $table) {
            $table->string('instagram_handle', 100)->nullable()->after('affiliate_network');
            $table->string('whatsapp_contact', 50)->nullable()->after('instagram_handle');
            $table->boolean('is_independent')->default(false)->after('whatsapp_contact');
            $table->enum('verification_status', ['VERIFIED', 'PENDING_REVIEW', 'REJECTED'])->default('VERIFIED')->after('is_independent');
            $table->string('submitted_by_email')->nullable()->after('verification_status');
            $table->text('community_notes')->nullable()->after('submitted_by_email');
        });

        // 2. Crear tabla store_branches (sucursales físicas para geolocalización y geofencing)
        Schema::create('store_branches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained('affiliate_stores')->cascadeOnDelete();
            $table->string('name'); // Ej: "Río Supermercado - C.C. Traki"
            $table->string('slug')->unique(); // Ej: "rio-supermercado-traki-valle-de-la-pascua"
            $table->string('state', 100)->default('Guárico');
            $table->string('city', 100)->default('Valle de la Pascua');
            $table->text('address');
            $table->string('reference_point')->nullable(); // Ej: "C.C. Traki, Planta Baja, Local L-4"
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->unsignedInteger('geofence_radius_meters')->default(90); // Radio de detección en tienda
            $table->string('phone', 50)->nullable();
            $table->string('whatsapp', 50)->nullable();
            $table->string('opening_hours', 150)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Índices para optimizar consultas de geolocalización por región sin saturar CPU
            $table->index(['state', 'city', 'is_active'], 'idx_branches_state_city_active');
            $table->index(['latitude', 'longitude'], 'idx_branches_coordinates');
        });

        // 3. Ampliar product_store_offers para vincular con sucursales específicas y moneda VES
        Schema::table('product_store_offers', function (Blueprint $table) {
            $table->foreignId('branch_id')->nullable()->after('store_id')->constrained('store_branches')->nullOnDelete();
            $table->decimal('price_ves', 12, 2)->nullable()->after('price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_store_offers', function (Blueprint $table) {
            $table->dropConstrainedForeignId('branch_id');
            $table->dropColumn('price_ves');
        });

        Schema::dropIfExists('store_branches');

        Schema::table('affiliate_stores', function (Blueprint $table) {
            $table->dropColumn([
                'instagram_handle',
                'whatsapp_contact',
                'is_independent',
                'verification_status',
                'submitted_by_email',
                'community_notes',
            ]);
        });
    }
};
