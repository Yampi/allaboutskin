<?php

namespace Tests\Unit;

use App\Domain\Cosmetics\Services\InciParserService;
use App\Models\ClinicalIndication;
use App\Models\Ingredient;
use App\Models\IngredientAlias;
use App\Models\IngredientConflict;
use App\Models\PubMedStudy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class InciParserServiceTest extends TestCase
{
    use RefreshDatabase;

    protected InciParserService $parser;
    protected Ingredient $aqua;
    protected Ingredient $niacinamide;
    protected Ingredient $zincPca;
    protected Ingredient $salicylicAcid;

    protected function setUp(): void
    {
        parent::setUp();
        $this->parser = new InciParserService();

        // Seed clinical indicators & studies
        $indication = ClinicalIndication::create([
            'name' => 'Control de Sebo',
            'slug' => 'sebum-control',
            'description' => 'Reducción de secreción sebácea.',
        ]);

        $study = PubMedStudy::create([
            'pmid' => '16029679',
            'title' => 'Niacinamide clinical efficacy',
            'journal' => 'Dermatologic Surgery',
            'pub_year' => 2005,
            'study_type' => 'RCT',
            'evidence_grade' => 'A',
            'url' => 'https://pubmed.ncbi.nlm.nih.gov/16029679/',
        ]);

        // Seed base ingredients
        $this->aqua = Ingredient::create([
            'inci_name' => 'AQUA',
            'common_name' => 'Agua Purificada',
            'is_active' => false,
        ]);

        $this->niacinamide = Ingredient::create([
            'inci_name' => 'NIACINAMIDE',
            'common_name' => 'Vitamina B3',
            'is_active' => true,
        ]);
        $this->niacinamide->indications()->attach($indication->id, ['evidence_level' => 'A']);
        $this->niacinamide->pubmedStudies()->attach($study->id);

        IngredientAlias::create([
            'ingredient_id' => $this->niacinamide->id,
            'alias' => 'NICOTINAMIDE',
        ]);
        IngredientAlias::create([
            'ingredient_id' => $this->niacinamide->id,
            'alias' => 'VITAMIN B3',
        ]);

        $this->zincPca = Ingredient::create([
            'inci_name' => 'ZINC PCA',
            'common_name' => 'Sal de Zinc',
            'is_active' => true,
        ]);

        $this->salicylicAcid = Ingredient::create([
            'inci_name' => 'SALICYLIC ACID',
            'common_name' => 'Ácido Salicílico',
            'is_active' => true,
        ]);

        IngredientConflict::create([
            'ingredient_a_id' => $this->niacinamide->id,
            'ingredient_b_id' => $this->salicylicAcid->id,
            'conflict_type' => 'PH_INCOMPATIBILITY',
            'severity' => 'LOW',
            'warning_message' => 'Precaución de pH',
            'clinical_rationale' => 'Diferencia en pH óptimo',
            'mitigation_strategy' => 'Alternar mañana y noche',
        ]);
    }

    public function test_parse_and_match_uses_bounded_queries_and_under_2_5mb_ram(): void
    {
        $rawInci = "Aqua, Niacinamide (10%), Zinc PCA (1%), Phenoxyethanol";

        // Warm up connection/caches
        $this->parser->parseAndMatch("Aqua");

        $startMem = memory_get_usage(false);
        DB::enableQueryLog();
        DB::flushQueryLog();

        $result = $this->parser->parseAndMatch($rawInci);

        $queries = DB::getQueryLog();
        DB::disableQueryLog();
        $memoryUsedBytes = memory_get_usage(false) - $startMem;

        // El número de consultas no debe crecer con el tamaño del catálogo:
        // exacta + alias + fuzzy acotado (máx. 2) + hidratación (1 + 4 relaciones)
        $this->assertLessThanOrEqual(
            9,
            count($queries),
            'InciParserService ejecutó demasiadas consultas: ' . count($queries)
        );

        // Ninguna consulta a ingredients puede ser un escaneo completo de la tabla
        foreach ($queries as $query) {
            $sql = strtolower($query['query']);
            if (preg_match('/from "?ingredients"?/', $sql)) {
                $this->assertMatchesRegularExpression(
                    '/\b(where|limit)\b/',
                    $sql,
                    "Consulta sin WHERE ni LIMIT sobre ingredients: {$query['query']}"
                );
            }
        }

        $maxAllowedMemory = 2.5 * 1024 * 1024; // 2.5MB in bytes
        $this->assertLessThan(
            $maxAllowedMemory,
            $memoryUsedBytes,
            "InciParserService memory usage must be under 2.5MB. Actual: " . ($memoryUsedBytes / 1024 / 1024) . "MB"
        );

        $this->assertCount(3, $result['matched_ingredients']);
        $this->assertContains('Phenoxyethanol', $result['unmatched_tokens']);
    }

    public function test_exact_matches_via_inci_name_and_common_name(): void
    {
        $rawInci = "AQUA, Vitamina B3";
        $result = $this->parser->parseAndMatch($rawInci);

        $matched = $result['matched_ingredients'];
        $this->assertCount(2, $matched);

        $this->assertEquals('AQUA', $matched[0]['ingredient']->inci_name);
        $this->assertEquals(1.0, $matched[0]['confidence']);

        $this->assertEquals('NIACINAMIDE', $matched[1]['ingredient']->inci_name);
        $this->assertEquals(1.0, $matched[1]['confidence']);
    }

    public function test_alias_resolution_via_where_in(): void
    {
        $rawInci = "Nicotinamide, Vitamin B3";
        $result = $this->parser->parseAndMatch($rawInci);

        $matched = $result['matched_ingredients'];
        $this->assertCount(2, $matched);

        foreach ($matched as $m) {
            $this->assertEquals($this->niacinamide->id, $m['ingredient']->id);
            $this->assertEquals(0.98, $m['confidence']);
        }
    }

    public function test_fuzzy_resolution_bounded_candidate_pool(): void
    {
        // OCR typo with minor misspelling: "NIACINAMID" instead of "NIACINAMIDE"
        $rawInci = "Niacinamid";
        $result = $this->parser->parseAndMatch($rawInci);

        $matched = $result['matched_ingredients'];
        $this->assertCount(1, $matched);
        $this->assertEquals('NIACINAMIDE', $matched[0]['ingredient']->inci_name);
        $this->assertGreaterThanOrEqual(0.78, $matched[0]['confidence']);
    }

    public function test_deferred_relational_hydration_only_loads_relations_for_matched(): void
    {
        $rawInci = "Aqua, Niacinamide (10%)";
        $result = $this->parser->parseAndMatch($rawInci);

        $matched = $result['matched_ingredients'];
        $this->assertCount(2, $matched);

        $niacinamideModel = $matched[1]['ingredient'];
        // Relationships must be loaded on the model
        $this->assertTrue($niacinamideModel->relationLoaded('indications'));
        $this->assertTrue($niacinamideModel->relationLoaded('pubmedStudies'));
        $this->assertTrue($niacinamideModel->relationLoaded('conflictsAsA'));
        $this->assertTrue($niacinamideModel->relationLoaded('conflictsAsB'));

        $this->assertCount(1, $niacinamideModel->indications);
        $this->assertCount(1, $niacinamideModel->pubmedStudies);
        $this->assertCount(1, $niacinamideModel->conflictsAsA);
    }

    public function test_tokenize_and_normalize_clean_cosmetic_prefixes_and_percentages(): void
    {
        $rawInci = "Serum Facial: Aqua, Niacinamide 10%, Zinc PCA (1.0 %), Salicylic Acid 2%";
        $tokens = $this->parser->tokenize($rawInci);

        $this->assertCount(4, $tokens);
        $this->assertEquals('Aqua', $tokens[0]);
        $this->assertEquals('Niacinamide 10%', $tokens[1]);

        $this->assertEquals('AQUA', $this->parser->normalizeToken($tokens[0]));
        $this->assertEquals('NIACINAMIDE', $this->parser->normalizeToken($tokens[1]));
        $this->assertEquals('ZINC PCA', $this->parser->normalizeToken($tokens[2]));
        $this->assertEquals('SALICYLIC ACID', $this->parser->normalizeToken($tokens[3]));
    }

    public function test_empty_input_returns_empty_collections_safely(): void
    {
        $result = $this->parser->parseAndMatch("");
        $this->assertEmpty($result['raw_tokens']);
        $this->assertEmpty($result['matched_ingredients']);
        $this->assertEmpty($result['unmatched_tokens']);

        $resultSpaces = $this->parser->parseAndMatch("   ");
        $this->assertEmpty($resultSpaces['raw_tokens']);
        $this->assertEmpty($resultSpaces['matched_ingredients']);
        $this->assertEmpty($resultSpaces['unmatched_tokens']);
    }
}
