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
        Schema::create('ai_product_insights', function (Blueprint $table) {
            $table->id();
            $table->string('product_hash', 64)->unique()->index();
            $table->string('product_name')->nullable()->index();
            $table->string('brand_name')->nullable()->index();
            $table->decimal('price', 10, 2)->nullable();
            $table->string('currency', 5)->default('USD');
            
            // Format & Physical Matrix
            $table->boolean('is_physical_applicator')->default(false);
            $table->enum('format_type', [
                'LIQUID_SERUM',
                'CREAM_OR_BALM',
                'GEL_OR_LOTION',
                'CLEANSING_WIPES',
                'EXFOLIATING_PADS',
                'SHEET_MASK',
                'HYDROCOLLOID_PATCH',
                'SKINCARE_TOOL',
                'MISCELLANEOUS'
            ])->default('LIQUID_SERUM');
            
            $table->enum('friction_risk_level', ['NONE', 'LOW', 'MODERATE', 'HIGH'])->default('NONE');
            $table->boolean('is_rinse_off_required')->default(false);
            
            // AI Synthesized Clinical Guidance
            $table->text('barrier_warning')->nullable();
            $table->text('plain_language_summary');
            $table->json('contraindications')->nullable(); // ["Rosácea activa", "Acné inflamatorio"]
            $table->json('quality_factors')->nullable();   // ["Tensioactivos no iónicos", "Tejido biodegradable"]
            $table->decimal('format_quality_score', 3, 1)->default(8.0); // 0.0 to 10.0
            
            // Recommendations & Commercial
            $table->text('when_to_use')->nullable();
            $table->text('how_to_use')->nullable();
            $table->json('superior_alternatives')->nullable(); // ["Doble limpieza con aceite/bálsamo", "Agua micelar con algodón reutilizable"]
            
            // Metadata & Flywheel Engine
            $table->enum('source_type', ['AI_GENERATED', 'EXPERT_VERIFIED', 'DETERMINISTIC_CACHE'])->default('AI_GENERATED');
            $table->decimal('confidence_score', 3, 2)->default(0.95);
            $table->unsignedBigInteger('lookup_count')->default(1);
            $table->timestamp('last_queried_at')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_product_insights');
    }
};
