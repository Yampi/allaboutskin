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
        Schema::table('store_branches', function (Blueprint $table) {
            $table->string('municipality', 100)->nullable()->after('state'); // Municipio (ej: Leonardo Infante, Chacao, Sucre, Libertador)
            $table->string('parish', 100)->nullable()->after('municipality'); // Parroquia (ej: Valle de la Pascua, Chacao, Petare, El Recreo)

            $table->index(['state', 'municipality', 'city'], 'idx_branches_state_muni_city');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('store_branches', function (Blueprint $table) {
            $table->dropIndex('idx_branches_state_muni_city');
            $table->dropColumn(['municipality', 'parish']);
        });
    }
};
