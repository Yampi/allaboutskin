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
            $table->string('country_code', 10)->default('VE')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('affiliate_stores', function (Blueprint $table) {
            $table->string('country_code', 5)->default('VE')->change();
        });
    }
};
