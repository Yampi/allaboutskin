<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Ingredient;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogProductMatchTest extends TestCase
{
    use RefreshDatabase;

    private function product(Brand $brand, string $name, bool $withFormula = true): Product
    {
        $product = Product::create(['brand_id' => $brand->id, 'name' => $name, 'slug' => str($name)->slug()]);
        if ($withFormula) {
            $ingredient = Ingredient::firstOrCreate(['inci_name' => 'NIACINAMIDE'], ['common_name' => 'Vitamina B3', 'is_active' => true]);
            $product->ingredients()->attach($ingredient->id, ['position' => 1]);
        }

        return $product;
    }

    public function test_finds_product_read_from_package_front(): void
    {
        $ordinary = Brand::create(['name' => 'The Ordinary', 'slug' => 'the-ordinary']);
        $this->product($ordinary, 'Niacinamide 10% + Zinc 1%');
        $this->product($ordinary, 'Hyaluronic Acid 2% + B5');

        $this->getJson('/api/v1/catalog/products/match?brand=The%20Ordinary&name=' . urlencode('NIACINAMIDE 10% + ZINC 1%'))
            ->assertOk()
            ->assertJsonPath('data.0.name', 'Niacinamide 10% + Zinc 1%')
            ->assertJsonPath('data.0.brand', 'The Ordinary')
            ->assertJsonPath('data.0.brand_matched', true)
            ->assertJsonPath('data.0.has_formula', true)
            ->assertJsonPath('data.0.score', 1);
    }

    public function test_returns_nothing_when_only_some_words_match_a_short_query(): void
    {
        $brand = Brand::create(['name' => 'Bazar Natural', 'slug' => 'bazar-natural']);
        $this->product($brand, 'Alfa Arbutina Pura');

        // "Alpha Bisabolol": ninguna palabra completa coincide con un producto concreto
        $this->getJson('/api/v1/catalog/products/match?name=' . urlencode('Alfa Bisabolol'))
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_requires_a_name(): void
    {
        $this->getJson('/api/v1/catalog/products/match?brand=CeraVe')->assertStatus(422);
    }
}
