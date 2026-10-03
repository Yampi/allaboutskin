<?php

namespace App\Console\Commands;

use App\Models\Ingredient;
use App\Services\Scraper\Geocoding\NominatimGeocodingService;
use App\Services\Scraper\Pipeline\OfferSyncService;
use App\Services\Scraper\Services\MultiStoreCrawlerEngine;
use Illuminate\Console\Command;

class CrawlActiveIngredientsCommand extends Command
{
    protected $signature = 'scraper:cron-cycle 
                            {--limit=2 : Número de ingredientes a procesar en este ciclo}
                            {--force : Desactivar omisión de URLs existentes y forzar re-procesamiento}';

    protected $description = 'Ejecuta un ciclo rotativo (Round-Robin) multi-tienda para los ingredientes activos con mayor prioridad o antigüedad.';

    public function handle(): int
    {
        $limit = (int) $this->option('limit');
        $force = (bool) $this->option('force');
        $skipExisting = !$force;

        $this->info("===================================================================");
        $this->info(" 🔄 Allabout.skin - Ciclo Continuo de Rastreo Multi-Tienda [" . now()->format('Y-m-d H:i:s') . "]");
        $this->info("===================================================================");

        // Seleccionar los ingredientes con mayor prioridad/antigüedad (Round-Robin)
        $ingredients = Ingredient::where('is_active', true)
            ->orderByRaw('last_crawled_at ASC NULLS FIRST')
            ->take($limit)
            ->get();

        if ($ingredients->isEmpty()) {
            $this->warn("No hay ingredientes activos registrados para rastrear.");
            return self::SUCCESS;
        }

        $syncService = new OfferSyncService(new NominatimGeocodingService());
        $crawlerEngine = new MultiStoreCrawlerEngine($syncService);

        $results = [];

        foreach ($ingredients as $ingredient) {
            $this->line("🔬 Procesando activo: <comment>{$ingredient->inci_name}</comment> (Última vez: " . ($ingredient->last_crawled_at?->diffForHumans() ?? 'Nunca') . ")");

            $start = microtime(true);
            $res = $crawlerEngine->crawlForIngredient($ingredient, $skipExisting);
            $duration = round(microtime(true) - $start, 2);

            $results[] = [
                'Activo (INCI)' => $res['inci_name'],
                'Tiendas' => $res['stores_count'],
                'Evaluados' => $res['total_evaluated'],
                'Aprobados Gate' => $res['total_accepted'],
                'Rechazados Gate' => $res['total_rejected'],
                'Nuevos Guardados' => $res['new_offers_synced'],
                'Errores' => $res['errors_count'] ?? 0,
                'Duración (s)' => "{$duration}s",
            ];
        }

        $this->newLine();
        $this->table(
            array_keys($results[0] ?? []),
            $results
        );

        $this->info("✅ Ciclo de rastreo completado con éxito.");
        return self::SUCCESS;
    }
}
