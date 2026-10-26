<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Las puntuaciones de un escaneo solo existen si el análisis las devuelve.
 * Se eliminan los valores por defecto (75/80/75/65/60/55, "NORMAL") que hacían pasar
 * datos inventados por resultados reales, y la imagen deja de ser obligatoria.
 */
return new class extends Migration
{
    private array $scoreColumns = [
        'overall_score',
        'hydration_score',
        'elasticity_score',
        'pores_score',
        'spots_score',
        'fine_lines_score',
    ];

    public function up(): void
    {
        Schema::table('user_skin_scans', function (Blueprint $table) {
            foreach ($this->scoreColumns as $column) {
                $table->unsignedSmallInteger($column)->nullable()->default(null)->change();
            }
            $table->string('barrier_status')->nullable()->default(null)->change();
            $table->text('image_url')->nullable()->change();
        });
    }

    public function down(): void
    {
        $defaults = [
            'overall_score' => 75, 'hydration_score' => 80, 'elasticity_score' => 75,
            'pores_score' => 65, 'spots_score' => 60, 'fine_lines_score' => 55,
        ];

        Schema::table('user_skin_scans', function (Blueprint $table) use ($defaults) {
            foreach ($defaults as $column => $value) {
                $table->unsignedSmallInteger($column)->nullable(false)->default($value)->change();
            }
            $table->string('barrier_status')->nullable(false)->default('NORMAL')->change();
            $table->text('image_url')->nullable(false)->change();
        });
    }
};
