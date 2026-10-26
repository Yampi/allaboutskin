<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Reseñas honestas: sin valores por defecto inventados, "verificada" solo si el
 * usuario tiene el producto en su rutina, una reseña por usuario y producto, y
 * un voto "útil" por usuario.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_reviews', function (Blueprint $table) {
            $table->string('usage_duration')->nullable()->default(null)->change();
            $table->boolean('is_verified')->default(false)->change();
            $table->unique(['user_id', 'product_slug']);
        });

        // Recalcula la verificación de las reseñas existentes con el criterio real.
        DB::statement(<<<'SQL'
            UPDATE product_reviews SET is_verified = EXISTS (
                SELECT 1 FROM user_routine_items uri
                JOIN products p ON p.id = uri.product_id
                WHERE uri.user_id = product_reviews.user_id
                  AND p.slug = product_reviews.product_slug
            )
        SQL);

        Schema::create('review_helpful_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_review_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['product_review_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('review_helpful_votes');

        Schema::table('product_reviews', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'product_slug']);
            $table->string('usage_duration')->nullable()->default('2 a 4 semanas')->change();
            $table->boolean('is_verified')->default(true)->change();
        });
    }
};
