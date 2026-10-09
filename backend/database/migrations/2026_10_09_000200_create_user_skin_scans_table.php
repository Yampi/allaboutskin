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
        Schema::create('user_skin_scans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('session_token')->nullable()->index(); // for unauthenticated sessions
            $table->text('image_url');
            $table->unsignedSmallInteger('overall_score')->default(75);
            $table->unsignedSmallInteger('hydration_score')->default(80);
            $table->unsignedSmallInteger('elasticity_score')->default(75);
            $table->unsignedSmallInteger('pores_score')->default(65);
            $table->unsignedSmallInteger('spots_score')->default(60);
            $table->unsignedSmallInteger('fine_lines_score')->default(55);
            $table->string('barrier_status')->default('NORMAL'); // OPTIMAL, NORMAL, COMPROMISED
            $table->string('scan_mode')->default('face'); // face, product, vr_routine
            $table->text('clinical_summary')->nullable();
            $table->text('recommendations')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_skin_scans');
    }
};
