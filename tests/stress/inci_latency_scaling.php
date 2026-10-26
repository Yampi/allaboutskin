<?php
/**
 * INCI Parser Latency & SLA Scaling Diagnostic
 */

require_once __DIR__ . '/../../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../../backend/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Domain\Cosmetics\Services\InciParserService;
use App\Models\Ingredient;
use App\Models\IngredientAlias;

$parser = new InciParserService();

// Warm up
$parser->parseAndMatch("Aqua");

$scenarios = [
    'Small (5 ingredients, all matched)' => [
        'formula' => 'Aqua, Glycerin, Niacinamide, Zinc PCA, Hyaluronic Acid',
        'expected_max_ms' => 50.0
    ],
    'Typical Serum (12 ingredients, 8 matched, 4 excipients)' => [
        'formula' => 'Aqua, Glycerin, Niacinamide 10%, Zinc PCA 1%, Phenoxyethanol, Ethylhexylglycerin, Xanthan Gum, Disodium EDTA, Sodium Hydroxide, Citric Acid, Hyaluronic Acid, Panthenol',
        'expected_max_ms' => 50.0
    ],
    'Medium Cream (20 ingredients, 10 matched, 10 excipients)' => [
        'formula' => 'Aqua, Cetearyl Alcohol, Glycerin, Stearic Acid, Ceramide NP, Squalane, Dimethicone, Cyclopentasiloxane, Phenoxyethanol, Triethanolamine, Carbomer, Niacinamide, Retinol, Tocopherol, Allantoin, BHT, Parfum, Polysorbate 20, Caprylyl Glycol, Disodium EDTA',
        'expected_max_ms' => 50.0
    ],
    'Large Formula (30 ingredients, 15 matched, 15 excipients)' => [
        'formula' => 'Aqua, Glycerin, Butylene Glycol, Niacinamide, Centella Asiatica Extract, Salicylic Acid, Glycolic Acid, Lactic Acid, Azelaic Acid, Bakuchiol, Squalane, Ceramide NP, Panthenol, Allantoin, Zinc PCA, Phenoxyethanol, Ethylhexylglycerin, Carbomer, Disodium EDTA, Xanthan Gum, Caprylyl Glycol, Dimethicone, Polysorbate 20, Cetearyl Alcohol, Stearic Acid, Potassium Sorbate, Sodium Benzoate, Citric Acid, Triethanolamine, CI 19140',
        'expected_max_ms' => 50.0
    ],
    'Extreme Formula (50 ingredients, 20 matched, 30 excipients)' => [
        'formula' => 'Aqua / Water, Glycerin, Niacinamide (10%), Zinc PCA 1%, Salicylic Acid, Hyaluronic Acid 2%, Retinol (0.5%), Ascorbic Acid, Tocopherol, Ceramide NP, Panthenol (5%), Allantoin, Centella Asiatica Extract, Azelaic Acid (10%), Glycolic Acid 7%, Lactic Acid, Squalane 100%, Bakuchiol, Peptide Complex, Sodium Hydroxide, ALIAS_NIACINAMIDE, ALIAS_RETINOL, ALIAS_ASCORBIC ACID, ALIAS_GLYCERIN, ALIAS_PANTHENOL, Phenoxyethanol, Ethylhexylglycerin, Carbomer, Disodium EDTA, Xanthan Gum, Butylene Glycol, Caprylyl Glycol, Dimethicone, Cyclopentasiloxane, Polysorbate 20, Cetearyl Alcohol, Stearic Acid, Ceteareth-20, Potassium Sorbate, Sodium Benzoate, Citric Acid, Triethanolamine, BHT, Parfum / Fragrance, Linalool, Limonene, Citronellol, Hexyl Cinnamal, Geraniol, CI 19140',
        'expected_max_ms' => 50.0
    ]
];

echo "=================================================================\n";
echo "           INCI PARSER LATENCY SCALING BENCHMARK                 \n";
echo "=================================================================\n\n";

foreach ($scenarios as $name => $spec) {
    // Run 5 iterations to get statistically sound average & min
    $times = [];
    $memDeltas = [];

    for ($i = 0; $i < 5; $i++) {
        gc_collect_cycles();
        $startMem = memory_get_usage(false);
        $start = microtime(true);
        $res = $parser->parseAndMatch($spec['formula']);
        $duration = (microtime(true) - $start) * 1000;
        $mem = memory_get_usage(false) - $startMem;

        $times[] = $duration;
        $memDeltas[] = $mem;
    }

    $avgTime = array_sum($times) / count($times);
    $minTime = min($times);
    $maxTime = max($times);
    $avgMem = array_sum($memDeltas) / count($memDeltas);

    $slaPassed = $avgTime < $spec['expected_max_ms'];

    printf("%-55s\n", $name);
    printf("  Avg: %6.2f ms | Min: %6.2f ms | Max: %6.2f ms | Mem: %6.2f KB | SLA: %s\n",
        $avgTime, $minTime, $maxTime, $avgMem / 1024,
        $slaPassed ? "PASS (<50ms)" : "BREACH (>=50ms)"
    );
    printf("  Tokens: %d total, %d matched, %d unmatched\n\n",
        count($res['raw_tokens']),
        $res['matched_ingredients']->count(),
        count($res['unmatched_tokens'])
    );
}
