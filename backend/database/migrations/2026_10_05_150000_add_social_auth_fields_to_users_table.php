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
        Schema::table('users', function (Blueprint $table) {
            $table->string('password')->nullable()->change();
            $table->string('provider', 30)->nullable()->after('email');
            $table->string('provider_id', 150)->nullable()->index()->after('provider');
            $table->string('avatar_url', 500)->nullable()->after('provider_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('password')->nullable(false)->change();
            $table->dropIndex(['provider_id']);
            $table->dropColumn(['provider', 'provider_id', 'avatar_url']);
        });
    }
};
