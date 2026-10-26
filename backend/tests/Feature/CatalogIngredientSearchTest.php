<?php

namespace Tests\Feature;

use App\Models\Ingredient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogIngredientSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_ingredient_search_ignores_case(): void
    {
        Ingredient::create(['inci_name' => 'NIACINAMIDE', 'common_name' => 'Vitamina B3', 'is_active' => true]);
        Ingredient::create(['inci_name' => 'GLYCERIN', 'common_name' => 'Glicerina', 'is_active' => true]);

        foreach (['niacinamide', 'NIACINAMIDE', 'vitamina b3'] as $term) {
            $this->getJson('/api/v1/catalog/ingredients?q=' . urlencode($term))
                ->assertOk()
                ->assertJsonPath('total', 1)
                ->assertJsonPath('data.0.inci_name', 'NIACINAMIDE');
        }
    }
}
