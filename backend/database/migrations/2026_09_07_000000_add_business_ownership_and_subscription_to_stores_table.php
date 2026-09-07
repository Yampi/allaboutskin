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
        // 1. Ampliar affiliate_stores con ownership y suscripciones
        Schema::table('affiliate_stores', function (Blueprint $table) {
            $table->foreignId('owner_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
            $table->string('subscription_tier', 50)->default('FREE')->after('verification_status');
            $table->timestamp('subscription_expires_at')->nullable()->after('subscription_tier');
            $table->boolean('is_featured')->default(false)->after('subscription_expires_at');
            $table->timestamp('verified_at')->nullable()->after('is_featured');
            $table->text('rejected_reason')->nullable()->after('verified_at');

            // Índices para optimizar búsquedas por dueño y estado comercial
            $table->index(['owner_id'], 'idx_stores_owner_id');
            $table->index(['subscription_tier', 'is_featured'], 'idx_stores_subscription_featured');
        });

        // 2. Crear tabla de interacciones de clientes y leads comerciales
        Schema::create('store_lead_interactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained('affiliate_stores')->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained('store_branches')->nullOnDelete();
            $table->string('interaction_type', 50); // WHATSAPP_CLICK, PHONE_CLICK, MAP_ROUTE, IN_STORE_VIEW, PRODUCT_CLICK
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['store_id', 'interaction_type', 'created_at'], 'idx_leads_store_type_date');
            $table->index(['branch_id', 'interaction_type'], 'idx_leads_branch_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('store_lead_interactions');

        Schema::table('affiliate_stores', function (Blueprint $table) {
            $table->dropConstrainedForeignId('owner_id');
            $table->dropIndex('idx_stores_subscription_featured');
            $table->dropColumn([
                'subscription_tier',
                'subscription_expires_at',
                'is_featured',
                'verified_at',
                'rejected_reason',
            ]);
        });
    }
};
