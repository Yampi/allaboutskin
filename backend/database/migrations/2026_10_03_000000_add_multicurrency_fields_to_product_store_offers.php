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
        Schema::table('product_store_offers', function (Blueprint $table) {
            if (!Schema::hasColumn('product_store_offers', 'price_local')) {
                $table->decimal('price_local', 14, 2)->nullable()->after('price');
            }
            if (!Schema::hasColumn('product_store_offers', 'currency_local')) {
                $table->string('currency_local', 10)->nullable()->after('currency');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_store_offers', function (Blueprint $table) {
            if (Schema::hasColumn('product_store_offers', 'currency_local')) {
                $table->dropColumn('currency_local');
            }
            if (Schema::hasColumn('product_store_offers', 'price_local')) {
                $table->dropColumn('price_local');
            }
        });
    }
};
