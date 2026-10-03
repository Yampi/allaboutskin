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
        Schema::create('product_price_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('offer_id')->constrained('product_store_offers')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('store_id')->constrained('affiliate_stores')->cascadeOnDelete();
            $table->decimal('old_price_usd', 10, 2);
            $table->decimal('new_price_usd', 10, 2);
            $table->decimal('old_price_ves', 14, 2)->nullable();
            $table->decimal('new_price_ves', 14, 2)->nullable();
            $table->decimal('difference_usd', 10, 2)->default(0.00);
            $table->decimal('percentage_change', 8, 2)->default(0.00);
            $table->enum('change_type', [
                'INCREASE',      // Precio subió
                'DECREASE',      // Rebaja / Descuento
                'INITIAL',       // Registro inicial
                'OUT_OF_STOCK',  // Se agotó
                'RESTOCKED',     // Volvió a estar disponible
                'UNCHANGED'      // Revisión sin cambio de precio
            ])->default('UNCHANGED');
            $table->boolean('was_in_stock')->default(true);
            $table->boolean('is_in_stock')->default(true);
            $table->timestamp('recorded_at')->useCurrent();
            $table->timestamps();

            $table->index(['offer_id', 'recorded_at']);
            $table->index(['product_id', 'recorded_at']);
        });

        // Asegurar índice en product_url para búsquedas ultra rápidas de URLs existentes
        Schema::table('product_store_offers', function (Blueprint $table) {
            $table->index('product_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_store_offers', function (Blueprint $table) {
            $table->dropIndex(['product_url']);
        });

        Schema::dropIfExists('product_price_histories');
    }
};
