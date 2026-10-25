<?php
require 'backend/vendor/autoload.php';
$app = require 'backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Domain\Cosmetics\Services\InciParserService;
use App\Models\Ingredient;
use Illuminate\Support\Facades\DB;

DB::beginTransaction();

$parser = new InciParserService();
$parser->parseAndMatch("AQUA");

$sizes = [5, 10, 20, 25, 30, 40, 50];

echo "Ingredient Count | Time (ms) | Memory (KB) | SLA Status (<50ms)\n";
echo "-----------------+-----------+-------------+-------------------\n";

foreach ($sizes as $count) {
    $names = [];
    for ($i = 1; $i <= $count; $i++) {
        $name = "MATCHED_ING_{$count}_{$i}";
        Ingredient::create(['inci_name' => $name, 'is_active' => true]);
        $names[] = $name;
    }
    $rawInci = implode(', ', $names);

    gc_collect_cycles();
    $startMem = memory_get_usage(false);
    $start = microtime(true);
    $res = $parser->parseAndMatch($rawInci);
    $time = (microtime(true) - $start) * 1000;
    $mem = memory_get_usage(false) - $startMem;

    $sla = $time < 50.0 ? "PASS" : "BREACH";
    printf("%16d | %8.2f  | %10.2f  | %s\n", $count, $time, $mem / 1024, $sla);
}

DB::rollBack();
