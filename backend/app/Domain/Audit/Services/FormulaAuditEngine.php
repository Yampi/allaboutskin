<?php

namespace App\Domain\Audit\Services;

use App\Domain\Cosmetics\Services\InciParserService;
use App\Domain\Evidence\Services\PubMedApiService;
use App\Models\Ingredient;
use App\Models\IngredientConflict;
use App\Models\Product;
use Illuminate\Support\Collection;

class FormulaAuditEngine
{
    public function __construct(
        protected InciParserService $inciParser,
        protected PubMedApiService $pubMedApi
    ) {}

    /**
     * Conduct a full scientific audit from raw INCI text or OCR scan.
     *
     * @param string $rawInciText
     * @param string|null $productName
     * @param string|null $brandName
     * @return array<string, mixed>
     */
    public function auditFromRawInci(string $rawInciText, ?string $productName = null, ?string $brandName = null): array
    {
        $parseResult = $this->inciParser->parseAndMatch($rawInciText);
        $matched = $parseResult['matched_ingredients'];

        return $this->buildAuditReport(
            ingredients: $matched->pluck('ingredient'),
            ingredientDetails: $matched,
            productName: $productName,
            brandName: $brandName,
            unmatchedTokens: $parseResult['unmatched_tokens']
        );
    }

    /**
     * Conduct a full scientific audit on an existing catalog product.
     *
     * @param Product $product
     * @return array<string, mixed>
     */
    public function auditProduct(Product $product): array
    {
        $product->load(['brand', 'ingredients.indications', 'ingredients.pubmedStudies', 'ingredients.conflictsAsA', 'ingredients.conflictsAsB']);

        $ingredients = $product->ingredients;
        $ingredientDetails = $ingredients->map(function ($ing) {
            return [
                'ingredient' => $ing,
                'raw_token' => $ing->inci_name,
                'confidence' => 1.0,
                'position' => $ing->pivot->position ?? 1,
                'concentration_percentage' => $ing->pivot->concentration_percentage,
                'is_declared_active' => $ing->pivot->is_declared_active,
            ];
        });

        return $this->buildAuditReport(
            ingredients: $ingredients,
            ingredientDetails: $ingredientDetails,
            productName: $product->name,
            brandName: $product->brand->name ?? null,
            product: $product
        );
    }

    /**
     * Core aggregation logic for the structured scientific report.
     *
     * @param Collection<int, Ingredient> $ingredients
     * @param Collection<int, array<string, mixed>> $ingredientDetails
     * @param string|null $productName
     * @param string|null $brandName
     * @param array<string> $unmatchedTokens
     * @param Product|null $product
     * @return array<string, mixed>
     */
    protected function buildAuditReport(
        Collection $ingredients,
        Collection $ingredientDetails,
        ?string $productName = null,
        ?string $brandName = null,
        array $unmatchedTokens = [],
        ?Product $product = null
    ): array {
        $activeIngredients = $ingredients->filter(fn (Ingredient $ing) => $ing->is_active);

        // 1. Clinical Indications Aggregation
        $indications = $this->aggregateClinicalIndications($ingredients);

        // 2. PubMed Evidence & Studies
        $evidenceData = $this->compileEvidenceAndStudies($activeIngredients);

        // 3. Application Timing & Layering Protocol
        $layeringProtocol = $this->calculateLayeringProtocol($ingredients, $product);

        // 4. Estimated Clinical Timelines
        $timeline = $this->calculateResultsTimeline($activeIngredients);

        // 5. Chemical Conflicts & Incompatibilities
        $conflicts = $this->detectChemicalConflicts($ingredients);

        // 6. Safety & Irritation Index
        $safetyMetrics = $this->calculateSafetyMetrics($ingredients);

        return [
            'meta' => [
                'product_name' => $productName ?? ($product->name ?? 'Fórmula Personalizada'),
                'brand_name' => $brandName ?? ($product->brand->name ?? null),
                'total_ingredients_count' => $ingredients->count(),
                'active_ingredients_count' => $activeIngredients->count(),
                'unmatched_tokens_count' => count($unmatchedTokens),
                'unmatched_tokens' => $unmatchedTokens,
                'audited_at' => now()->toIso8601String(),
            ],
            'clinical_indications' => $indications,
            'scientific_evidence' => $evidenceData,
            'layering_and_usage' => $layeringProtocol,
            'results_timeline' => $timeline,
            'chemical_conflicts' => $conflicts,
            'safety_and_skin_tolerance' => $safetyMetrics,
            'ingredients_breakdown' => $this->formatIngredientsBreakdown($ingredientDetails),
        ];
    }

    /**
     * Group and rank clinical indications by strength of evidence.
     */
    protected function aggregateClinicalIndications(Collection $ingredients): array
    {
        $indicationsMap = [];

        foreach ($ingredients as $ingredient) {
            foreach ($ingredient->indications as $indication) {
                $slug = $indication->slug;
                if (!isset($indicationsMap[$slug])) {
                    $indicationsMap[$slug] = [
                        'name' => $indication->name,
                        'slug' => $indication->slug,
                        'description' => $indication->description,
                        'supporting_actives' => [],
                        'highest_evidence_level' => 'D',
                    ];
                }

                $evidenceLevel = $indication->pivot->evidence_level ?? 'C';
                $indicationsMap[$slug]['supporting_actives'][] = [
                    'inci_name' => $ingredient->inci_name,
                    'common_name' => $ingredient->common_name,
                    'evidence_level' => $evidenceLevel,
                    'mechanism' => $indication->pivot->target_mechanism,
                ];

                // Upgrade highest evidence level if higher
                if ($this->compareEvidenceGrades($evidenceLevel, $indicationsMap[$slug]['highest_evidence_level']) < 0) {
                    $indicationsMap[$slug]['highest_evidence_level'] = $evidenceLevel;
                }
            }
        }

        // Sort indications by highest evidence level (A before B before C)
        usort($indicationsMap, function ($a, $b) {
            return $this->compareEvidenceGrades($a['highest_evidence_level'], $b['highest_evidence_level']);
        });

        return array_values($indicationsMap);
    }

    /**
     * Gather PubMed studies, count trials, and synthesize evidence grade.
     */
    protected function compileEvidenceAndStudies(Collection $actives): array
    {
        $allStudies = collect();
        $totalIndexedPmids = 0;
        $grades = [];

        foreach ($actives as $active) {
            // Retrieve cached or online synced studies
            $studies = $this->pubMedApi->searchAndSyncStudies($active, 4);

            foreach ($studies as $study) {
                $allStudies->push([
                    'pmid' => $study->pmid,
                    'title' => $study->title,
                    'journal' => $study->journal,
                    'pub_year' => $study->pub_year,
                    'study_type' => $study->study_type,
                    'evidence_grade' => $study->evidence_grade,
                    'pubmed_url' => $study->url ?? "https://pubmed.ncbi.nlm.nih.gov/{$study->pmid}/",
                    'associated_active' => $active->inci_name,
                ]);

                $grades[] = $study->evidence_grade;
                $totalIndexedPmids++;
            }
        }

        // Compute overall evidence grade
        $overallGrade = 'B';
        if (in_array('A', $grades)) {
            $overallGrade = 'A';
        } elseif (empty($grades)) {
            $overallGrade = $actives->isNotEmpty() ? 'C' : 'D';
        }

        return [
            'overall_evidence_grade' => $overallGrade,
            'evidence_grade_label' => match ($overallGrade) {
                'A' => 'Evidencia Clínica Muy Alta (Revisiones Sistemáticas / Ensayos RCT)',
                'B' => 'Evidencia Clínica Moderada (Ensayos Clínicos Controlados en Humanos)',
                'C' => 'Evidencia Preliminar (Estudios In Vivo / Observacionales)',
                default => 'Evidencia Teórica / Mecanística',
            },
            'total_referenced_studies' => $allStudies->unique('pmid')->count(),
            'studies' => $allStudies->unique('pmid')->values()->all(),
        ];
    }

    /**
     * Determine optimal application time, layering step order (pH & texture), and SPF requirement.
     */
    protected function calculateLayeringProtocol(Collection $ingredients, ?Product $product = null): array
    {
        $requiresSunscreen = false;
        $isUvSensitizing = false;
        $timingFlags = ['AM' => 0, 'PM' => 0];
        $layerStep = 'WATER_BASED_SERUM';

        foreach ($ingredients as $ing) {
            if ($ing->requires_sunscreen || $ing->is_uv_sensitizing) {
                $requiresSunscreen = true;
                $isUvSensitizing = true;
            }

            if ($ing->recommended_timing === 'PM') {
                $timingFlags['PM'] += 2;
            } elseif ($ing->recommended_timing === 'AM') {
                $timingFlags['AM'] += 2;
            } else {
                $timingFlags['AM'] += 1;
                $timingFlags['PM'] += 1;
            }
        }

        // Determine recommended timing
        $recommendedTiming = 'BOTH';
        if ($timingFlags['PM'] > $timingFlags['AM'] * 1.5 || $isUvSensitizing) {
            $recommendedTiming = 'PM';
        } elseif ($timingFlags['AM'] > $timingFlags['PM'] * 1.5) {
            $recommendedTiming = 'AM';
        }

        // Step hierarchy based on product texture or dominant ingredient category
        $categoryOrder = [
            'CLEANSER' => 1,
            'LOW_PH_TREATMENT' => 2,
            'WATER_BASED_SERUM' => 3,
            'EMULSION_TREATMENT' => 4,
            'CREAM_OCCLUSIVE' => 5,
            'OIL' => 6,
            'SUNSCREEN' => 7,
        ];

        // Deduce step rank
        $stepOrder = 3;
        if ($product) {
            $stepOrder = match ($product->category) {
                'CLEANSER' => 1,
                'TONER', 'EXFOLIANT' => 2,
                'SERUM' => 3,
                'MOISTURIZER' => 5,
                'SUNSCREEN' => 7,
                default => 3,
            };
        } else {
            // Find lowest rank active
            $hasLowPh = $ingredients->contains(fn ($i) => $i->layering_category === 'LOW_PH_TREATMENT');
            $hasCleanser = $ingredients->contains(fn ($i) => $i->layering_category === 'CLEANSER');
            $hasCream = $ingredients->contains(fn ($i) => $i->layering_category === 'CREAM_OCCLUSIVE');

            if ($hasCleanser) $stepOrder = 1;
            elseif ($hasLowPh) $stepOrder = 2;
            elseif ($hasCream) $stepOrder = 5;
        }

        return [
            'recommended_timing' => $recommendedTiming,
            'timing_rationale' => $isUvSensitizing
                ? 'Se recomienda uso nocturno (PM) debido a que contiene activos fotosensibilizantes o renovadores celulares.'
                : 'Apto para uso diario mañana y/o noche según tolerancia.',
            'requires_sunscreen' => $requiresSunscreen,
            'sunscreen_rationale' => $requiresSunscreen
                ? 'Uso de protector solar FPS 50+ obligatorio en la mañana al utilizar este tratamiento.'
                : 'Uso de protector solar diario recomendado como parte de la rutina básica de prevención.',
            'layering_step_order' => $stepOrder,
            'layering_rule' => 'Aplicar de menor a mayor densidad: 1. Limpieza -> 2. Tónicos/Activos de bajo pH -> 3. Serums acuosos -> 4. Emulsiones/Cremas -> 5. Protector Solar (AM).',
        ];
    }

    /**
     * Calculate estimated response weeks based on active ingredients.
     */
    protected function calculateResultsTimeline(Collection $actives): array
    {
        if ($actives->isEmpty()) {
            return [
                'min_weeks' => 4,
                'max_weeks' => 8,
                'primary_driver' => 'Mantenimiento de hidratación y barrera cutánea',
                'timeline_breakdown' => [
                    'Semanas 1-2' => 'Mejora inmediata en hidratación y suavidad superficial.',
                    'Semanas 4-8' => 'Estabilización de la función barrera cutánea.',
                ],
            ];
        }

        $minWeeks = $actives->min('results_timeline_weeks_min') ?? 4;
        $maxWeeks = $actives->max('results_timeline_weeks_max') ?? 12;

        $drivers = $actives->map(fn ($a) => "{$a->inci_name} ({$a->results_timeline_weeks_min}-{$a->results_timeline_weeks_max} semanas)")->implode(', ');

        return [
            'min_weeks' => $minWeeks,
            'max_weeks' => $maxWeeks,
            'primary_driver' => "Impulsado por: {$drivers}",
            'milestones' => [
                "Semanas 1-{$minWeeks}" => 'Fase de adaptación celular, tolerancia inicial y descongestión.',
                "Semanas {$minWeeks}-{$maxWeeks}" => 'Resultados clínicos visibles en textura, pigmentación o firmeza según literatura médica.',
                "Semana {$maxWeeks}+" => 'Consolidación de resultados y fase de mantenimiento.',
            ],
        ];
    }

    /**
     * Cross-reference all ingredients against chemical conflict matrix.
     */
    protected function detectChemicalConflicts(Collection $ingredients): array
    {
        $conflicts = [];
        $ingredientIds = $ingredients->pluck('id')->filter()->all();

        if (count($ingredientIds) < 2) {
            return [];
        }

        // Query conflicts in both directions
        $conflictRecords = IngredientConflict::whereIn('ingredient_a_id', $ingredientIds)
            ->whereIn('ingredient_b_id', $ingredientIds)
            ->with(['ingredientA', 'ingredientB'])
            ->get();

        foreach ($conflictRecords as $record) {
            $conflicts[] = [
                'ingredient_a' => $record->ingredientA->inci_name,
                'ingredient_b' => $record->ingredientB->inci_name,
                'conflict_type' => $record->conflict_type,
                'severity' => $record->severity,
                'warning_message' => $record->warning_message,
                'clinical_rationale' => $record->clinical_rationale,
                'mitigation_strategy' => $record->mitigation_strategy,
            ];
        }

        return $conflicts;
    }

    /**
     * Calculate comedogenic & irritation index and identify flagged triggers.
     */
    protected function calculateSafetyMetrics(Collection $ingredients): array
    {
        $maxComedogenic = $ingredients->max('comedogenic_rating') ?? 0;
        $maxIrritation = $ingredients->max('irritation_rating') ?? 0;

        $flaggedComedogenic = $ingredients->filter(fn ($i) => $i->comedogenic_rating >= 3)->map(fn ($i) => [
            'inci_name' => $i->inci_name,
            'rating' => $i->comedogenic_rating,
        ])->values()->all();

        $flaggedIrritants = $ingredients->filter(fn ($i) => $i->irritation_rating >= 3)->map(fn ($i) => [
            'inci_name' => $i->inci_name,
            'rating' => $i->irritation_rating,
        ])->values()->all();

        return [
            'max_comedogenic_score' => $maxComedogenic,
            'max_irritation_score' => $maxIrritation,
            'is_non_comedogenic_certified' => $maxComedogenic <= 2,
            'flagged_comedogenic_ingredients' => $flaggedComedogenic,
            'flagged_irritant_ingredients' => $flaggedIrritants,
        ];
    }

    /**
     * Format detailed breakdown for every matched ingredient.
     */
    protected function formatIngredientsBreakdown(Collection $ingredientDetails): array
    {
        return $ingredientDetails->map(function ($item) {
            /** @var Ingredient $ing */
            $ing = $item['ingredient'];

            return [
                'inci_name' => $ing->inci_name,
                'common_name' => $ing->common_name,
                'cas_number' => $ing->cas_number,
                'is_active' => $ing->is_active,
                'cosing_functions' => $ing->cosing_functions ?? [],
                'comedogenic_rating' => $ing->comedogenic_rating,
                'irritation_rating' => $ing->irritation_rating,
                'optimal_ph_range' => ($ing->optimal_ph_min && $ing->optimal_ph_max) ? "{$ing->optimal_ph_min} - {$ing->optimal_ph_max}" : null,
                'position' => $item['position'] ?? 1,
                'match_confidence' => $item['confidence'] ?? 1.0,
            ];
        })->values()->all();
    }

    /**
     * Compare evidence grades (A > B > C > D). Returns <0 if $a is higher grade than $b.
     */
    protected function compareEvidenceGrades(string $a, string $b): int
    {
        $ranks = ['A' => 1, 'B' => 2, 'C' => 3, 'D' => 4];
        return ($ranks[$a] ?? 5) <=> ($ranks[$b] ?? 5);
    }
}
