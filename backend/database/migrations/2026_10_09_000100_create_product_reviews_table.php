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
        Schema::create('product_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->string('product_slug')->index();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('user_name')->default('Usuario AllAboutSkin');
            $table->string('user_skin_type')->nullable(); // Oily, Sensitive, Combination, Dry, Balanced
            $table->unsignedTinyInteger('rating'); // 1 to 5 stars
            $table->string('title');
            $table->text('comment');
            $table->string('usage_duration')->default('2 a 4 semanas'); // '1 semana', '2 a 4 semanas', 'Más de 2 meses'
            $table->boolean('is_verified')->default(true);
            $table->unsignedInteger('helpful_count')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_reviews');
    }
};
