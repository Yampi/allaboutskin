<?php

namespace Tests\Feature;

use App\Models\ProductReview;
use App\Models\User;
use App\Models\UserRoutineItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductReviewHonestyTest extends TestCase
{
    use RefreshDatabase;

    private const SLUG = 'serum-niacinamida-10';

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'rating' => 4,
            'title' => 'Me ayudó con el brillo',
            'comment' => 'Lo usé por las noches y noté menos brillo en la zona T.',
        ], $overrides);
    }

    private function createProduct(): int
    {
        $brandId = DB::table('brands')->insertGetId(['name' => 'Marca de prueba', 'slug' => 'marca-de-prueba']);

        return DB::table('products')->insertGetId([
            'brand_id' => $brandId,
            'name' => 'Sérum Niacinamida 10%',
            'slug' => self::SLUG,
        ]);
    }

    public function test_publishing_a_review_requires_authentication(): void
    {
        $this->postJson('/api/v1/catalog/products/'.self::SLUG.'/reviews', $this->payload())
            ->assertStatus(401);

        $this->assertDatabaseCount('product_reviews', 0);
    }

    public function test_review_uses_real_user_name_and_never_invents_metadata_or_verification(): void
    {
        $user = User::factory()->create(['name' => 'Ana Real']);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/catalog/products/'.self::SLUG.'/reviews', $this->payload([
            'user_name' => 'Dr. Inventado (Farmacéutico)',
        ]))->assertCreated()
            ->assertJsonPath('review.user_name', 'Ana Real')
            ->assertJsonPath('review.user_skin_type', null)
            ->assertJsonPath('review.usage_duration', null)
            ->assertJsonPath('review.is_verified', false);
    }

    public function test_review_is_verified_only_when_the_product_is_in_the_users_routine(): void
    {
        $productId = $this->createProduct();
        $user = User::factory()->create();
        UserRoutineItem::create(['user_id' => $user->id, 'product_id' => $productId]);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/catalog/products/'.self::SLUG.'/reviews', $this->payload())
            ->assertCreated()
            ->assertJsonPath('review.is_verified', true)
            ->assertJsonPath('review.product_id', $productId);
    }

    public function test_a_user_can_only_review_a_product_once(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/catalog/products/'.self::SLUG.'/reviews', $this->payload())->assertCreated();
        $this->postJson('/api/v1/catalog/products/'.self::SLUG.'/reviews', $this->payload())
            ->assertStatus(409)
            ->assertJsonPath('error_type', 'REVIEW_ALREADY_EXISTS');

        $this->assertDatabaseCount('product_reviews', 1);
    }

    public function test_index_has_no_estimated_average_and_does_not_mix_similar_slugs(): void
    {
        $this->getJson('/api/v1/catalog/products/'.self::SLUG.'/reviews')
            ->assertOk()
            ->assertJsonPath('average_rating', null)
            ->assertJsonPath('total_reviews', 0);

        ProductReview::create([
            'product_slug' => self::SLUG.'-zinc',
            'user_name' => 'Otra persona',
            'rating' => 5,
            'title' => 'Otro producto',
            'comment' => 'Reseña de un producto con slug parecido.',
        ]);

        $this->getJson('/api/v1/catalog/products/'.self::SLUG.'/reviews')
            ->assertJsonPath('total_reviews', 0);
    }

    public function test_helpful_vote_requires_authentication_and_counts_once_per_user(): void
    {
        $review = ProductReview::create([
            'product_slug' => self::SLUG,
            'user_name' => 'Autora',
            'rating' => 5,
            'title' => 'Muy bueno',
            'comment' => 'Funcionó bien para mi piel mixta.',
        ]);

        $this->postJson("/api/v1/catalog/reviews/{$review->id}/helpful")->assertStatus(401);

        Sanctum::actingAs(User::factory()->create());
        $this->postJson("/api/v1/catalog/reviews/{$review->id}/helpful")->assertJsonPath('helpful_count', 1);
        $this->postJson("/api/v1/catalog/reviews/{$review->id}/helpful")->assertJsonPath('helpful_count', 1);
    }

    public function test_publishing_reviews_is_rate_limited(): void
    {
        Sanctum::actingAs(User::factory()->create());

        for ($i = 0; $i < 5; $i++) {
            $this->postJson("/api/v1/catalog/products/producto-{$i}/reviews", $this->payload());
        }

        $this->postJson('/api/v1/catalog/products/producto-extra/reviews', $this->payload())
            ->assertStatus(429)
            ->assertJsonPath('error_type', 'TOO_MANY_REQUESTS')
            ->assertHeader('Retry-After');
    }
}
