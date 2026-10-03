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
        Schema::table('affiliate_stores', function (Blueprint $table) {
            $table->string('crawler_platform', 50)->nullable()->default('MANUAL'); // VTEX, SHOPIFY, WOOCOMMERCE, SCHEMA_ORG, MANUAL
            $table->string('catalog_search_url')->nullable();
            $table->boolean('crawler_enabled')->default(false)->index();
            $table->timestamp('last_crawled_at')->nullable()->index();
        });

        Schema::table('ingredients', function (Blueprint $table) {
            $table->timestamp('last_crawled_at')->nullable()->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ingredients', function (Blueprint $table) {
            $table->dropColumn('last_crawled_at');
        });

        Schema::table('affiliate_stores', function (Blueprint $table) {
            $table->dropColumn([
                'crawler_platform',
                'catalog_search_url',
                'crawler_enabled',
                'last_crawled_at',
            ]);
        });
    }
};
