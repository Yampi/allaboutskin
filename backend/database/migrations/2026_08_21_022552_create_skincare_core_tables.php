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
        // 1. Ingredients Master Table (CosIng aligned)
        Schema::create('ingredients', function (Blueprint $table) {
            $table->id();
            $table->string('inci_name')->unique()->index();
            $table->string('common_name')->nullable()->index();
            $table->string('cas_number')->nullable()->index();
            $table->string('ec_number')->nullable();
            $table->string('cosing_id')->nullable()->index();
            $table->text('description')->nullable();
            $table->json('cosing_functions')->nullable(); // e.g. ["ANTIOXIDANT", "SKIN CONDITIONING"]
            $table->unsignedTinyInteger('comedogenic_rating')->default(0); // 0 - 5
            $table->unsignedTinyInteger('irritation_rating')->default(0); // 0 - 5
            $table->decimal('optimal_ph_min', 4, 2)->nullable();
            $table->decimal('optimal_ph_max', 4, 2)->nullable();
            $table->decimal('molecular_weight', 8, 2)->nullable();
            $table->boolean('is_active')->default(false);
            $table->boolean('is_uv_sensitizing')->default(false);
            $table->boolean('requires_sunscreen')->default(false);
            $table->enum('recommended_timing', ['AM', 'PM', 'BOTH', 'EITHER'])->default('BOTH');
            $table->enum('layering_category', [
                'CLEANSER',
                'LOW_PH_TREATMENT',
                'WATER_BASED_SERUM',
                'EMULSION_TREATMENT',
                'CREAM_OCCLUSIVE',
                'OIL',
                'SUNSCREEN'
            ])->default('WATER_BASED_SERUM');
            $table->text('clinical_summary')->nullable();
            $table->unsignedSmallInteger('results_timeline_weeks_min')->nullable();
            $table->unsignedSmallInteger('results_timeline_weeks_max')->nullable();
            $table->timestamps();
        });

        // 2. Ingredient Aliases (for OCR & fuzzy matching)
        Schema::create('ingredient_aliases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ingredient_id')->constrained()->cascadeOnDelete();
            $table->string('alias')->index();
            $table->string('language', 10)->default('en');
            $table->timestamps();
        });

        // 3. Clinical Indications
        Schema::create('clinical_indications', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 4. Ingredient <-> Clinical Indication (Pivot with Evidence Level)
        Schema::create('ingredient_clinical_indications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ingredient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('clinical_indication_id')->constrained()->cascadeOnDelete();
            $table->enum('evidence_level', ['A', 'B', 'C', 'D'])->default('B'); // A: High RCTs, B: Moderate, C: In Vivo, D: In Vitro
            $table->decimal('effective_concentration_min', 5, 2)->nullable(); // %
            $table->text('target_mechanism')->nullable();
            $table->timestamps();
        });

        // 5. PubMed Studies Database
        Schema::create('pubmed_studies', function (Blueprint $table) {
            $table->id();
            $table->string('pmid')->unique()->index();
            $table->text('title');
            $table->string('journal')->nullable();
            $table->unsignedSmallInteger('pub_year')->nullable();
            $table->string('study_type')->default('CLINICAL_TRIAL'); // META_ANALYSIS, RCT, REVIEW, etc.
            $table->enum('evidence_grade', ['A', 'B', 'C', 'D'])->default('B');
            $table->string('doi')->nullable();
            $table->text('abstract')->nullable();
            $table->text('conclusions')->nullable();
            $table->string('url')->nullable();
            $table->timestamps();
        });

        // 6. Ingredient <-> PubMed Study Pivot
        Schema::create('ingredient_pubmed_studies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ingredient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('pubmed_study_id')->constrained()->cascadeOnDelete();
            $table->text('primary_finding')->nullable();
            $table->timestamps();
        });

        // 7. Chemical Conflicts & Incompatibilities
        Schema::create('ingredient_conflicts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ingredient_a_id')->constrained('ingredients')->cascadeOnDelete();
            $table->foreignId('ingredient_b_id')->constrained('ingredients')->cascadeOnDelete();
            $table->enum('conflict_type', [
                'PH_INCOMPATIBILITY',
                'IRRITATION_OVERLOAD',
                'CHEMICAL_DEGRADATION',
                'CHELATION',
                'DEACTIVATION'
            ]);
            $table->enum('severity', ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'])->default('MODERATE');
            $table->text('warning_message');
            $table->text('clinical_rationale');
            $table->text('mitigation_strategy')->nullable();
            $table->timestamps();
        });

        // 8. Brands & Products
        Schema::create('brands', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->string('logo_url')->nullable();
            $table->string('country_origin', 50)->nullable();
            $table->boolean('is_verified')->default(true);
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('brand_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('barcode_ean')->nullable()->index();
            $table->string('category')->default('SERUM'); // CLEANSER, TONER, SERUM, MOISTURIZER, SUNSCREEN, EXFOLIANT
            $table->decimal('volume_amount', 8, 2)->default(30.00); // 30, 50, 100
            $table->enum('volume_unit', ['ml', 'g', 'oz'])->default('ml');
            $table->enum('container_type', ['BOTTLE_DROPPER', 'PUMP', 'JAR', 'TUBE', 'STICK'])->default('BOTTLE_DROPPER');
            $table->unsignedSmallInteger('pao_months')->default(12); // e.g. 6M, 12M
            $table->decimal('dosage_per_application_ml', 4, 2)->default(0.50); // standard ~0.5ml
            $table->enum('recommended_timing', ['AM', 'PM', 'BOTH'])->default('BOTH');
            $table->string('texture_type')->default('LIGHT_SERUM');
            $table->decimal('ph_level', 4, 2)->nullable();
            $table->string('image_url')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_verified')->default(true);
            $table->timestamps();
        });

        // 9. Product Ingredients INCI List
        Schema::create('product_ingredients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ingredient_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('position'); // 1, 2, 3...
            $table->decimal('concentration_percentage', 5, 2)->nullable();
            $table->boolean('is_declared_active')->default(false);
            $table->timestamps();
        });

        // 10. User Skin Profile
        Schema::create('user_skin_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->enum('skin_type', ['OILY', 'DRY', 'COMBINATION', 'NORMAL', 'SENSITIVE'])->default('NORMAL');
            $table->unsignedTinyInteger('fitzpatrick_type')->default(3); // 1-6
            $table->enum('barrier_status', ['HEALTHY', 'COMPROMISED', 'ACUTELY_DAMAGED'])->default('HEALTHY');
            $table->json('active_conditions')->nullable(); // ["ACNE", "ROSACEA", "MELASMA"]
            $table->json('known_allergens')->nullable(); // ["FRAGRANCE", "LINALOOL"]
            $table->enum('sun_exposure_level', ['LOW', 'MODERATE', 'HIGH'])->default('MODERATE');
            $table->boolean('pregnancy_or_nursing')->default(false);
            $table->timestamps();
        });

        // 11. User Routine Items & Adherence
        Schema::create('user_routine_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('custom_name')->nullable();
            $table->enum('slot', ['AM', 'PM'])->default('AM');
            $table->enum('cycle_type', [
                'EVERYDAY',
                'EXFOLIATION_NIGHT',
                'RETINOID_NIGHT',
                'RECOVERY_NIGHT',
                'SPECIFIC_DAYS'
            ])->default('EVERYDAY');
            $table->unsignedTinyInteger('step_order')->default(1);
            $table->date('opened_at')->nullable(); // for PAO tracking
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('routine_adherence_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_routine_item_id')->nullable()->constrained()->nullOnDelete();
            $table->date('completed_date')->index();
            $table->enum('slot', ['AM', 'PM']);
            $table->unsignedTinyInteger('skin_feeling_rating')->nullable(); // 1 to 5
            $table->string('photo_url')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 12. Stores & Affiliate Deals
        Schema::create('affiliate_stores', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->string('website_url');
            $table->string('logo_url')->nullable();
            $table->enum('store_type', ['ONLINE', 'PHYSICAL', 'HYBRID'])->default('ONLINE');
            $table->string('country_code', 5)->default('ES');
            $table->string('affiliate_network')->nullable(); // Amazon, CJ, Awin, etc.
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('product_store_offers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('store_id')->constrained('affiliate_stores')->cascadeOnDelete();
            $table->string('product_url');
            $table->text('affiliate_url');
            $table->decimal('price', 8, 2);
            $table->string('currency', 3)->default('EUR');
            $table->boolean('in_stock')->default(true);
            $table->timestamp('last_checked_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_store_offers');
        Schema::dropIfExists('affiliate_stores');
        Schema::dropIfExists('routine_adherence_logs');
        Schema::dropIfExists('user_routine_items');
        Schema::dropIfExists('user_skin_profiles');
        Schema::dropIfExists('product_ingredients');
        Schema::dropIfExists('products');
        Schema::dropIfExists('brands');
        Schema::dropIfExists('ingredient_conflicts');
        Schema::dropIfExists('ingredient_pubmed_studies');
        Schema::dropIfExists('pubmed_studies');
        Schema::dropIfExists('ingredient_clinical_indications');
        Schema::dropIfExists('clinical_indications');
        Schema::dropIfExists('ingredient_aliases');
        Schema::dropIfExists('ingredients');
    }
};

