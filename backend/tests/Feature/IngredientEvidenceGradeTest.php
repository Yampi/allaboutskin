<?php

namespace Tests\Feature;

use App\Domain\Evidence\Services\EvidenceGradeCalculator;
use App\Models\Ingredient;
use App\Models\PubMedStudy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class IngredientEvidenceGradeTest extends TestCase
{
    use RefreshDatabase;

    private function makeIngredient(string $inci, bool $active = true): Ingredient
    {
        return Ingredient::create(['inci_name' => $inci, 'common_name' => $inci, 'is_active' => $active]);
    }

    private function linkStudy(Ingredient $ingredient, string $pmid, string $grade): void
    {
        $study = PubMedStudy::create([
            'pmid' => $pmid,
            'title' => "Estudio {$pmid}",
            'journal' => 'Test Journal',
            'pub_year' => 2020,
            'study_type' => 'RCT',
            'evidence_grade' => $grade,
        ]);
        $ingredient->pubmedStudies()->attach($study->id, ['primary_finding' => 'test']);
    }

    public function test_best_grade_returns_null_without_studies(): void
    {
        $calculator = new EvidenceGradeCalculator();

        $this->assertNull($calculator->bestGrade([]));
        $this->assertSame('B', $calculator->bestGrade(['C', 'B', 'D']));
        $this->assertSame('A', $calculator->bestGrade(['C', 'A']));
    }

    public function test_new_ingredient_has_no_evidence_level_by_default(): void
    {
        $ingredient = $this->makeIngredient('TEST ACTIVE')->fresh();

        $this->assertNull($ingredient->evidence_level);
        $this->assertSame('Sin estudios vinculados en nuestra base', $ingredient->evidence_grade_description);
    }

    public function test_refresh_derives_level_from_linked_studies(): void
    {
        $ingredient = $this->makeIngredient('TEST ACTIVE');
        $this->linkStudy($ingredient, '1001', 'C');
        $this->linkStudy($ingredient, '1002', 'B');

        $grade = app(EvidenceGradeCalculator::class)->refresh($ingredient);

        $this->assertSame('B', $grade);
        $this->assertSame('B', $ingredient->fresh()->evidence_level);
    }

    public function test_audit_reports_no_grade_when_active_has_no_studies(): void
    {
        Http::fake(['*' => Http::response([], 500)]);
        $this->makeIngredient('ZZ UNSTUDIED ACTIVE');

        $evidence = $this->postJson('/api/v1/audit/inci', ['inci_text' => 'ZZ UNSTUDIED ACTIVE'])
            ->assertOk()
            ->json('data.scientific_evidence');

        $this->assertNull($evidence['overall_evidence_grade']);
        $this->assertSame(0, $evidence['total_referenced_studies']);
        $this->assertSame(0, $evidence['by_ingredient'][0]['studies_count']);
        $this->assertNull($evidence['by_ingredient'][0]['evidence_grade']);
    }

    public function test_audit_uses_best_real_study_grade(): void
    {
        Http::fake(['*' => Http::response([], 500)]);
        $ingredient = $this->makeIngredient('ZZ STUDIED ACTIVE');
        $this->linkStudy($ingredient, '2001', 'C');
        $this->linkStudy($ingredient, '2002', 'A');
        $this->linkStudy($ingredient, '2003', 'D');

        $evidence = $this->postJson('/api/v1/audit/inci', ['inci_text' => 'ZZ STUDIED ACTIVE'])
            ->assertOk()
            ->json('data.scientific_evidence');

        $this->assertSame('A', $evidence['overall_evidence_grade']);
        $this->assertSame(3, $evidence['total_referenced_studies']);
        $this->assertSame('A', $evidence['by_ingredient'][0]['evidence_grade']);
    }
}
