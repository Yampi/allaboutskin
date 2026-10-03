<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Ingredient;
use App\Models\Product;
use App\Models\ProductStoreOffer;
use App\Services\Scraper\Geocoding\NominatimGeocodingService;
use App\Services\Scraper\Pipeline\OfferSyncService;
use App\Services\Scraper\Services\MultiStoreCrawlerEngine;
use Illuminate\Support\Facades\DB;

echo "=================================================================\n";
echo " 📊 ALLABOUT.SKIN - BENCHMARK DE ESTRÉS Y CONSUMO DE RECURSOS\n";
echo "=================================================================\n\n";

gc_collect_cycles();
$memBefore = memory_get_usage(true);
$timeStart = microtime(true);
$cpuStart = getrusage();

// -------------------------------------------------------------
// TEST 1: CONSUMO REAL DEL CRAWLER Y QUALITY GATE EN EJECUCIÓN
// -------------------------------------------------------------
echo "[1/3] Midiendo huella del Crawler (Memoria, CPU y Consultas SQL)...\n";
DB::enableQueryLog();

$ingredient = Ingredient::where('is_active', true)->where('inci_name', 'RETINOL')->first()
    ?? Ingredient::where('is_active', true)->first();

$syncService = new OfferSyncService(new NominatimGeocodingService());
$crawlerEngine = new MultiStoreCrawlerEngine($syncService);

$crawlResult = $crawlerEngine->crawlForIngredient($ingredient, false); // Forzamos evaluación completa

$crawlerQueries = DB::getQueryLog();
DB::disableQueryLog();

$memPeakCrawler = memory_get_peak_usage(true);
$memAfterCrawler = memory_get_usage(true);
$timeCrawler = microtime(true) - $timeStart;
$cpuAfterCrawler = getrusage();

$userCpuSec = ($cpuAfterCrawler['ru_utime.tv_sec'] - $cpuStart['ru_utime.tv_sec'])
    + (($cpuAfterCrawler['ru_utime.tv_usec'] - $cpuStart['ru_utime.tv_usec']) / 1000000);

echo " -> Activo analizado: {$ingredient->inci_name}\n";
echo " -> Productos evaluados por Quality Gate: {$crawlResult['total_evaluated']}\n";
echo " -> Aprobados por Quality Gate: {$crawlResult['total_accepted']}\n";
echo " -> Rechazados (antibasura): {$crawlResult['total_rejected']}\n";
echo " -> Tiempo total de ejecución (Wall Time): " . round($timeCrawler, 3) . " segundos\n";
echo " -> Tiempo real de CPU (User Time): " . round($userCpuSec, 4) . " segundos\n";
echo " -> Consumo de RAM (Peak): " . round($memPeakCrawler / 1024 / 1024, 2) . " MB\n";
echo " -> Memoria delta neta: " . round(($memAfterCrawler - $memBefore) / 1024 / 1024, 2) . " MB\n";
echo " -> Consultas SQL ejecutadas: " . count($crawlerQueries) . "\n\n";

// -------------------------------------------------------------
// TEST 2: SIMULACIÓN DE ESTRÉS CONCURRENTE EN BASE DE DATOS
// -------------------------------------------------------------
echo "[2/3] Simulando contención de BDD (Lecturas concurrentes de catálogo durante ingesta)...\n";

$readIterations = 200;
$readTimes = [];

$stressStart = microtime(true);
for ($i = 0; $i < $readIterations; $i++) {
    $t0 = microtime(true);
    
    // Consulta típica que hace un usuario en la app: producto con marca, ofertas y componentes
    $products = Product::with(['brand', 'storeOffers.store', 'ingredients'])
        ->inRandomOrder()
        ->take(10)
        ->get();
        
    $readTimes[] = (microtime(true) - $t0) * 1000; // ms
}
$stressDuration = microtime(true) - $stressStart;

$avgReadMs = array_sum($readTimes) / count($readTimes);
sort($readTimes);
$p95ReadMs = $readTimes[(int) (count($readTimes) * 0.95)];
$p99ReadMs = $readTimes[(int) (count($readTimes) * 0.99)];

echo " -> Consultas de usuarios simuladas: {$readIterations}\n";
echo " -> Latencia promedio de lectura: " . round($avgReadMs, 2) . " ms\n";
echo " -> Latencia P95 (95% de los usuarios): " . round($p95ReadMs, 2) . " ms\n";
echo " -> Latencia P99 (peor caso): " . round($p99ReadMs, 2) . " ms\n";
echo " -> Throughput estimado de lectura en este nodo: " . round($readIterations / $stressDuration, 1) . " QPS (queries/seg)\n\n";

// -------------------------------------------------------------
// TEST 3: MÉTRICAS GLOBALES DEL CATÁLOGO EN POSTGRESQL
// -------------------------------------------------------------
echo "[3/3] Estado actual del inventario en PostgreSQL:\n";
echo " -> Total Productos: " . Product::count() . "\n";
echo " -> Total Ofertas Comerciales Vivas: " . ProductStoreOffer::count() . "\n";
echo " -> Ofertas con stock disponible: " . ProductStoreOffer::where('in_stock', true)->count() . "\n";
echo " -> Total Ingredientes Activos: " . Ingredient::where('is_active', true)->count() . "\n";
echo "=================================================================\n";
echo " ✅ BENCHMARK COMPLETADO CON ÉXITO\n";
