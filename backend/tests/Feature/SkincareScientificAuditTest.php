<?php

namespace Tests\Feature;

use App\Domain\Audit\Services\FormulaAuditEngine;
use App\Domain\Cosmetics\Services\InciParserService;
use App\Models\User;
use Database\Seeders\SkincareScientificSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SkincareScientificAuditTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(SkincareScientificSeeder::class);
    }

    /** @test */
    public function it_correctly_audits_raw_inci_text_with_actives_evidence_and_layering()
    {
        $rawInci = "Aqua, Niacinamide (10%), Zinc PCA (1%), Phenoxyethanol";

        $response = $this->postJson('/api/v1/audit/inci', [
            'inci_text' => $rawInci,
            'product_name' => 'Custom B3 Serum',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'meta' => ['product_name', 'total_ingredients_count', 'active_ingredients_count'],
                    'clinical_indications',
                    'scientific_evidence' => ['overall_evidence_grade', 'total_referenced_studies'],
                    'layering_and_usage' => ['recommended_timing', 'layering_step_order', 'requires_sunscreen'],
                    'results_timeline' => ['min_weeks', 'max_weeks'],
                    'safety_and_skin_tolerance' => ['max_comedogenic_score'],
                    'ingredients_breakdown',
                ],
            ]);

        $data = $response->json('data');
        $this->assertEquals(2, $data['meta']['active_ingredients_count']);
        $this->assertNotEmpty($data['clinical_indications']);
    }

    /** @test */
    public function it_detects_chemical_conflicts_between_retinol_and_exfoliating_acids()
    {
        $conflictingInci = "Aqua, Retinol, Glycolic Acid, Glycerin";

        $response = $this->postJson('/api/v1/audit/inci', [
            'inci_text' => $conflictingInci,
        ]);

        $response->assertStatus(200);
        $conflicts = $response->json('data.chemical_conflicts');

        $this->assertNotEmpty($conflicts);
        $this->assertEquals('IRRITATION_OVERLOAD', $conflicts[0]['conflict_type']);
        $this->assertEquals('HIGH', $conflicts[0]['severity']);
        $this->assertStringContainsString('Skin Cycling', $conflicts[0]['mitigation_strategy']);
    }

    /** @test */
    public function it_evaluates_skin_compatibility_for_user_profile()
    {
        $user = User::where('email', 'sofia@skinaudit.io')->first();

        // Audit The Ordinary Niacinamide against user profile
        $response = $this->actingAs($user)->postJson('/api/v1/audit/compatibility', [
            'inci_text' => 'Aqua, Niacinamide, Zinc PCA',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'compatibility' => [
                    'compatibility_score',
                    'compatibility_level',
                    'compatibility_verdict',
                ],
                'audit_report',
            ]);

        $score = $response->json('compatibility.compatibility_score');
        $this->assertGreaterThanOrEqual(80, $score);
    }

    /** @test */
    public function it_calculates_skin_cycling_daily_routine_and_lifecycle()
    {
        $user = User::where('email', 'sofia@skinaudit.io')->first();

        // 1. Get today routine
        $responseRoutine = $this->actingAs($user)->getJson('/api/v1/routine/today');
        $responseRoutine->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'date',
                    'skin_cycling_phase',
                    'skin_cycling_label',
                    'am_routine',
                    'pm_routine',
                ],
            ]);

        // 2. Log adherence
        $responseLog = $this->actingAs($user)->postJson('/api/v1/routine/log', [
            'slot' => 'AM',
            'skin_feeling_rating' => 5,
            'notes' => 'Piel calmada y sin brillo.',
        ]);

        $responseLog->assertStatus(200)
            ->assertJson(['status' => 'success']);

        // 3. Check Lifecycle & Replenishment Restock monitor
        $responseLifecycle = $this->actingAs($user)->getJson('/api/v1/lifecycle/items');
        $responseLifecycle->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'summary' => ['total_tracked_products'],
                'data' => [
                    '*' => [
                        'product_name',
                        'container_volume',
                        'days_remaining',
                        'percentage_remaining',
                        'pao_months',
                        'status',
                        'restock_offers',
                    ],
                ],
            ]);
    }
}
