<?php

namespace Tests\Feature;

use App\Models\Ingredient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_reports_database_and_dataset_status(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertJsonStructure([
            'status',
            'uptime_status',
            'timestamp',
            'services' => ['database', 'ingredient_dataset'],
        ])->assertJsonMissingPath('environment')
          ->assertJsonPath('services.database', 'connected');

        $expectedDataset = Ingredient::query()->exists() ? 'loaded' : 'empty';
        $response->assertJsonPath('services.ingredient_dataset', $expectedDataset);
        $response->assertStatus($expectedDataset === 'loaded' ? 200 : 503);
    }
}
