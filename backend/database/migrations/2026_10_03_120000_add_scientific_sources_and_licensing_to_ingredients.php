<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Añade trazabilidad científica, licencias de datos y fecha de auditoría a la ficha de ingredientes.
     */
    public function up(): void
    {
        Schema::table('ingredients', function (Blueprint $table) {
            $table->string('source_name', 100)->nullable()->default('CosIng UE (Comisión Europea)')->after('cosing_id');
            $table->string('source_url', 500)->nullable()->after('source_name');
            $table->string('source_license', 100)->nullable()->default('EU Open Data / Public Domain')->after('source_url');
            $table->enum('evidence_level', ['A', 'B', 'C', 'D'])->default('B')->after('source_license');
            $table->timestamp('reviewed_at')->nullable()->after('evidence_level');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ingredients', function (Blueprint $table) {
            $table->dropColumn([
                'source_name',
                'source_url',
                'source_license',
                'evidence_level',
                'reviewed_at',
            ]);
        });
    }
};
