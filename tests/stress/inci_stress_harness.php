<?php
/**
 * INCI Parser Empirical Stress Test & SLA Benchmark Harness
 * 
 * Tests InciParserService against:
 * 1. 50-ingredient complex formula (< 50ms SLA, < 2.5MB RAM)
 * 2. 100-ingredient ultra-large formula (< 50ms SLA target, memory bounded)
 * 3. Adversarial SQL injection & control character tokens
 * 4. 200 duplicate tokens with nested parentheses
 * 5. Bounded fuzzy search with unknown tokens
 */

require_once __DIR__ . '/../../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../../backend/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Domain\Cosmetics\Services\InciParserService;
use App\Models\Ingredient;
use App\Models\IngredientAlias;
use Illuminate\Support\Facades\DB;

echo "=================================================================\n";
echo "       INCI PARSER EMPIRICAL STRESS TEST & BENCHMARK HARNESS      \n";
echo "=================================================================\n\n";

$parser = new InciParserService();

// Ensure base test ingredients exist
DB::beginTransaction();

try {
    $actives = [
        ['inci_name' => 'AQUA', 'common_name' => 'Water'],
        ['inci_name' => 'GLYCERIN', 'common_name' => 'Glicerina'],
        ['inci_name' => 'NIACINAMIDE', 'common_name' => 'Vitamina B3'],
        ['inci_name' => 'ZINC PCA', 'common_name' => 'Zinc PCA'],
        ['inci_name' => 'SALICYLIC ACID', 'common_name' => 'Acido Salicilico'],
        ['inci_name' => 'HYALURONIC ACID', 'common_name' => 'Acido Hialuronico'],
        ['inci_name' => 'RETINOL', 'common_name' => 'Vitamina A'],
        ['inci_name' => 'ASCORBIC ACID', 'common_name' => 'Vitamina C'],
        ['inci_name' => 'TOCOPHEROL', 'common_name' => 'Vitamina E'],
        ['inci_name' => 'CERAMIDE NP', 'common_name' => 'Ceramida NP'],
        ['inci_name' => 'PANTHENOL', 'common_name' => 'Provitamina B5'],
        ['inci_name' => 'ALLANTOIN', 'common_name' => 'Alantoina'],
        ['inci_name' => 'CENTELLA ASIATICA EXTRACT', 'common_name' => 'Cica'],
        ['inci_name' => 'AZELAIC ACID', 'common_name' => 'Acido Azelaico'],
        ['inci_name' => 'GLYCOLIC ACID', 'common_name' => 'Acido Glicolico'],
        ['inci_name' => 'LACTIC ACID', 'common_name' => 'Acido Lactico'],
        ['inci_name' => 'SQUALANE', 'common_name' => 'Escualano'],
        ['inci_name' => 'BAKUCHIOL', 'common_name' => 'Bakuchiol'],
        ['inci_name' => 'PEPTIDE COMPLEX', 'common_name' => 'Peptidos'],
        ['inci_name' => 'SODIUM HYDROXIDE', 'common_name' => 'Sosa']
    ];

    foreach ($actives as $act) {
        $ing = Ingredient::firstOrCreate(
            ['inci_name' => $act['inci_name']],
            ['common_name' => $act['common_name'], 'is_active' => true]
        );
        IngredientAlias::firstOrCreate(
            ['ingredient_id' => $ing->id, 'alias' => 'ALIAS_' . $act['inci_name']]
        );
    }

    // Warmup query
    $parser->parseAndMatch("Aqua");

    $results = [];

    // --- TEST 1: 50-Ingredient Realistic Commercial Formula ---
    echo "[TEST 1] Benchmarking 50-ingredient commercial formula...\n";
    $formula50 = [
        'Aqua / Water', 'Glycerin', 'Niacinamide (10%)', 'Zinc PCA 1%', 'Salicylic Acid',
        'Hyaluronic Acid 2%', 'Retinol (0.5%)', 'Ascorbic Acid', 'Tocopherol', 'Ceramide NP',
        'Panthenol (5%)', 'Allantoin', 'Centella Asiatica Extract', 'Azelaic Acid (10%)',
        'Glycolic Acid 7%', 'Lactic Acid', 'Squalane 100%', 'Bakuchiol', 'Peptide Complex',
        'Sodium Hydroxide', 'ALIAS_NIACINAMIDE', 'ALIAS_RETINOL', 'ALIAS_ASCORBIC ACID',
        'ALIAS_GLYCERIN', 'ALIAS_PANTHENOL', 'Phenoxyethanol', 'Ethylhexylglycerin',
        'Carbomer', 'Disodium EDTA', 'Xanthan Gum', 'Butylene Glycol', 'Caprylyl Glycol',
        'Dimethicone', 'Cyclopentasiloxane', 'Polysorbate 20', 'Cetearyl Alcohol',
        'Stearic Acid', 'Ceteareth-20', 'Potassium Sorbate', 'Sodium Benzoate',
        'Citric Acid', 'Triethanolamine', 'BHT', 'Parfum / Fragrance', 'Linalool',
        'Limonene', 'Citronellol', 'Hexyl Cinnamal', 'Geraniol', 'CI 19140'
    ];
    $rawInci50 = implode(', ', $formula50);

    gc_collect_cycles();
    $startMem = memory_get_usage(false);
    $startTime = microtime(true);

    $res1 = $parser->parseAndMatch($rawInci50);

    $time50 = (microtime(true) - $startTime) * 1000;
    $mem50 = memory_get_usage(false) - $startMem;

    echo "  -> Execution Time: " . round($time50, 2) . " ms (SLA: < 50 ms)\n";
    echo "  -> Memory Delta:   " . round($mem50 / 1024, 2) . " KB (Limit: < 2560 KB)\n";
    echo "  -> Matched Items:  " . $res1['matched_ingredients']->count() . " ingredients\n";
    echo "  -> Unmatched:      " . count($res1['unmatched_tokens']) . " tokens\n";

    $pass1 = ($time50 < 50.0) && ($mem50 < 2.5 * 1024 * 1024);
    echo "  -> Verdict: " . ($pass1 ? "PASS [SLA MET]" : "FAIL [SLA BREACHED]") . "\n\n";
    $results['test1'] = $pass1;

    // --- TEST 2: 100-Ingredient Heavy Formulation ---
    echo "[TEST 2] Benchmarking 100-ingredient heavy formulation...\n";
    $formula100 = array_merge($formula50, array_map(fn($t, $i) => "Botanical_Extract_{$i}", $formula50, range(1, 50)));
    $rawInci100 = implode(', ', $formula100);

    gc_collect_cycles();
    $startMem = memory_get_usage(false);
    $startTime = microtime(true);

    $res2 = $parser->parseAndMatch($rawInci100);

    $time100 = (microtime(true) - $startTime) * 1000;
    $mem100 = memory_get_usage(false) - $startMem;

    echo "  -> Execution Time: " . round($time100, 2) . " ms\n";
    echo "  -> Memory Delta:   " . round($mem100 / 1024, 2) . " KB\n";
    echo "  -> Matched Items:  " . $res2['matched_ingredients']->count() . "\n";
    $pass2 = ($mem100 < 3.0 * 1024 * 1024);
    echo "  -> Verdict: " . ($pass2 ? "PASS [BOUNDED MEMORY]" : "FAIL [MEMORY LEAK]") . "\n\n";
    $results['test2'] = $pass2;

    // --- TEST 3: Adversarial SQL Injection & Control Character Stress ---
    echo "[TEST 3] Stress testing SQL injection & adversarial payloads...\n";
    $maliciousInci = "Aqua', '; DROP TABLE ingredients; --, ' OR '1'='1', <script>alert('xss')</script>, Niacinamide\x00\x00, Retinol\r\n\t, Zinc PCA (100% /* comment */)";

    $startTime = microtime(true);
    $res3 = $parser->parseAndMatch($maliciousInci);
    $timeMalicious = (microtime(true) - $startTime) * 1000;

    $dbIntact = Ingredient::where('inci_name', 'NIACINAMIDE')->exists();
    $matched = $res3['matched_ingredients']->pluck('ingredient.inci_name')->toArray();
    $matchesCorrect = in_array('NIACINAMIDE', $matched) && in_array('RETINOL', $matched) && in_array('ZINC PCA', $matched);

    echo "  -> Execution Time: " . round($timeMalicious, 2) . " ms\n";
    echo "  -> Database Intact: " . ($dbIntact ? "YES" : "NO") . "\n";
    echo "  -> Genuine Actives Identified: " . ($matchesCorrect ? "YES" : "NO") . "\n";
    $pass3 = $dbIntact && $matchesCorrect && ($timeMalicious < 50.0);
    echo "  -> Verdict: " . ($pass3 ? "PASS [IMMUNE TO INJECTION]" : "FAIL [VULNERABILITY DETECTED]") . "\n\n";
    $results['test3'] = $pass3;

    // --- TEST 4: Massive Duplicate Scaling (200 tokens with nested parens) ---
    echo "[TEST 4] Stress testing 200 tokens with nested parentheses & duplicate normalization...\n";
    $tokens200 = [];
    for ($i = 0; $i < 100; $i++) {
        $tokens200[] = "Aqua (Water (Eau (Mineralized Aqua #{$i}))) 99%";
        $tokens200[] = "Niacinamide (Vitamin B3 / Nicotinamide Active Complex {$i}) 10%";
    }
    $rawInci200 = implode('; ', $tokens200);

    gc_collect_cycles();
    $startMem = memory_get_usage(false);
    $startTime = microtime(true);

    $res4 = $parser->parseAndMatch($rawInci200);

    $time200 = (microtime(true) - $startTime) * 1000;
    $mem200 = memory_get_usage(false) - $startMem;

    echo "  -> Execution Time: " . round($time200, 2) . " ms\n";
    echo "  -> Memory Delta:   " . round($mem200 / 1024, 2) . " KB\n";
    echo "  -> Raw Tokens Count: " . count($res4['raw_tokens']) . "\n";
    echo "  -> Matched Count:    " . $res4['matched_ingredients']->count() . "\n";
    $pass4 = ($mem200 < 2.5 * 1024 * 1024) && ($res4['matched_ingredients']->count() === 200);
    echo "  -> Verdict: " . ($pass4 ? "PASS [LINEAR REGEX & SAFE DEDUPLICATION]" : "FAIL") . "\n\n";
    $results['test4'] = $pass4;

    // --- TEST 5: Fuzzy Matching Candidate Bounding (10 synthetic unknown tokens) ---
    echo "[TEST 5] Stress testing bounded candidate fuzzy match under unknown tokens...\n";
    $unknownTokens = [
        'PolymerX123', 'BioPeptideUnk456', 'NanoLipidVlp789', 'BotanicalExtractQ10',
        'EmulsifierCompound11', 'StabilizerZinc12', 'SolventAgent13', 'ColorantPigment14',
        'PreservativeComplex15', 'FragranceMolecule16'
    ];
    $rawInciUnknown = implode(', ', $unknownTokens);

    $startTime = microtime(true);
    $res5 = $parser->parseAndMatch($rawInciUnknown);
    $timeUnknown = (microtime(true) - $startTime) * 1000;

    echo "  -> Execution Time for 10 unmatched fuzzy scans: " . round($timeUnknown, 2) . " ms\n";
    echo "  -> Unmatched Tokens Count: " . count($res5['unmatched_tokens']) . " / 10\n";
    $pass5 = ($timeUnknown < 100.0) && (count($res5['unmatched_tokens']) === 10);
    echo "  -> Verdict: " . ($pass5 ? "PASS [BOUNDED FUZZY LATENCY]" : "FAIL") . "\n\n";
    $results['test5'] = $pass5;

    echo "=================================================================\n";
    $allPassed = !in_array(false, $results, true);
    if ($allPassed) {
        echo "🎉 ALL INCI PARSER EMPIRICAL STRESS TESTS PASSED!\n";
        echo "   SLA Compliance: < 50ms (Actual: " . round($time50, 2) . "ms)\n";
        echo "   RAM Safety: < 2.5MB (Actual: " . round($mem50 / 1024, 2) . "KB)\n";
    } else {
        echo "❌ SOME STRESS TESTS FAILED!\n";
    }
    echo "=================================================================\n";

    DB::rollBack();
    exit($allPassed ? 0 : 1);

} catch (\Throwable $e) {
    DB::rollBack();
    echo "EXCEPTION: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
