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
        Schema::create('security_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('event_type'); // LOGIN_SUCCESS, LOGIN_FAILED, ACCOUNT_LOCKED, ROLE_CHANGED, CONFIG_UPDATED, SUSPICIOUS_REQUEST
            $table->string('severity')->default('INFO'); // INFO, WARNING, CRITICAL
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('resource_target')->nullable(); // Target User ID, Route or Resource affected
            $table->text('description');
            $table->json('payload')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('group')->default('general'); // general, security, ai, integrations
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string, integer, boolean, json, encrypted
            $table->string('description')->nullable();
            $table->boolean('is_public')->default(false); // Can public frontend read this
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('security_audit_logs');
        Schema::dropIfExists('system_settings');
    }
};
