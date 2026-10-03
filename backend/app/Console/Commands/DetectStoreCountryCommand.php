<?php

namespace App\Console\Commands;

use App\Models\AffiliateStore;
use App\Services\Scraper\Services\StoreCountryDetectorService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class DetectStoreCountryCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'crawler:detect-countries 
                            {--fix : Actualizar la base de datos con los países detectados}
                            {--store= : ID de una tienda específica para auditar}
                            {--force : Forzar auditoría sobre todas las tiendas}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Audita e identifica algorítmicamente el país de origen de cada tienda registrada en el catálogo.';

    public function handle(StoreCountryDetectorService $countryDetector): int
    {
        $shouldFix = (bool) $this->option('fix');
        $storeId = $this->option('store');
        $force = (bool) $this->option('force');

        $this->info("===================================================================");
        $this->info(" 🌎 ALLABOUTSKIN - DETECTOR Y SECTORIZADOR DE PAÍSES DE TIENDAS");
        $this->info("===================================================================");
        $this->info(" Modo: " . ($shouldFix ? "APLICAR CAMBIOS EN BD (--fix)" : "SOLO REVISIÓN / SIMULACIÓN (DRY-RUN)"));

        $query = AffiliateStore::query();
        if ($storeId) {
            $query->where('id', $storeId);
        }

        $stores = $query->orderBy('id')->get();
        $this->info(" Total tiendas a evaluar: " . $stores->count() . "\n");

        if ($stores->isEmpty()) {
            $this->warn("No se encontraron tiendas para procesar.");
            return Command::SUCCESS;
        }

        $tableRows = [];
        $countryCounts = [];
        $updatedCount = 0;

        $bar = $this->output->createProgressBar($stores->count());
        $bar->start();

        foreach ($stores as $store) {
            $currentCc = $store->country_code ?: 'N/A';
            $detection = $countryDetector->detectCountry($store->website_url);

            $detectedCc = $detection['country_code'];
            $flag = $detection['flag'];
            $countryName = $detection['country_name'];
            $confidence = $detection['confidence'];

            $countryCounts[$detectedCc] = ($countryCounts[$detectedCc] ?? 0) + 1;

            $statusText = 'IGUAL';
            if ($currentCc !== $detectedCc) {
                if ($shouldFix) {
                    $store->country_code = $detectedCc;
                    $store->save();
                    $statusText = 'CORREGIDO';
                    $updatedCount++;
                } else {
                    $statusText = 'DIFIERE';
                }
            }

            $tableRows[] = [
                $store->id,
                substr($store->name, 0, 25),
                $currentCc,
                "{$flag} {$detectedCc} ({$countryName})",
                "{$confidence}%",
                $statusText,
                implode(', ', array_slice($detection['signals'], 0, 2)),
            ];

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->table(
            ['ID', 'Tienda', 'CC Anterior', 'País Detectado', 'Confianza', 'Estado', 'Señales Clave'],
            $tableRows
        );

        $this->info("\n================= RESUMEN POR PAÍS =================");
        foreach ($countryCounts as $code => $count) {
            $meta = StoreCountryDetectorService::COUNTRIES[$code] ?? ['flag' => '🏳️', 'name' => $code];
            $this->line(" {$meta['flag']} {$meta['name']} ({$code}): {$count} tiendas");
        }
        $this->info("====================================================");

        if ($shouldFix) {
            $this->info("🎉 ¡Base de datos actualizada con éxito! {$updatedCount} tiendas fueron re-etiquetadas.");
            Log::channel('scraper')->info("[CountryDetectorCommand] Se actualizaron {$updatedCount} tiendas con su país real.");
        } else {
            $this->comment("💡 Para persistir los cambios en la base de datos, ejecuta: php artisan crawler:detect-countries --fix");
        }

        return Command::SUCCESS;
    }
}
