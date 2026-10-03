<?php

namespace App\Console\Commands;

use App\Services\Scraper\Discovery\WebStoreDiscoveryEngine;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class WebDiscoveryCrawlerCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'crawler:discover-web 
                            {--term= : Término o ingrediente activo específico para buscar}
                            {--limit=5 : Cantidad de consultas a ejecutar por ciclo}
                            {--daemon : Ejecutar en segundo plano en bucle continuo toda la noche}
                            {--interval=60 : Segundos de espera entre ciclos en modo daemon}
                            {--no-crawl : Solo descubrir y registrar tiendas sin rastrear productos de inmediato}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Rastrea la web abierta en busca de nuevas tiendas de Shopify, WooCommerce y VTEX que vendan cosméticos y las registra automáticamente.';

    public function handle(WebStoreDiscoveryEngine $discoveryEngine): int
    {
        $term = $this->option('term');
        $limit = (int) $this->option('limit');
        $isDaemon = (bool) $this->option('daemon');
        $interval = (int) $this->option('interval');
        $crawlImmediately = !$this->option('no-crawl');

        $this->info("===================================================================");
        $this->info(" 🌐 ALLABOUTSKIN - MOTOR DE DESCUBRIMIENTO WEB DE TIENDAS");
        $this->info("===================================================================");
        $this->info(" Modo: " . ($isDaemon ? "DAEMON NOCTURNO (Continuo)" : "CICLO ÚNICO"));
        $this->info(" Consultas por ciclo: {$limit}");
        $this->info(" Rastrear catálogo inmediato: " . ($crawlImmediately ? "SÍ" : "NO"));
        $this->info("===================================================================\n");

        $cycle = 1;

        do {
            $this->comment("Iniciando ciclo #{$cycle} de descubrimiento web...");
            Log::channel('scraper')->info("🌐 Iniciando ciclo #{$cycle} de crawler:discover-web");

            $startTime = microtime(true);
            $results = $discoveryEngine->discover($term, $limit, $crawlImmediately);
            $duration = round(microtime(true) - $startTime, 2);

            $this->info("\n--- RESUMEN DEL CICLO #{$cycle} ({$duration}s) ---");
            $this->line(" Consultas web ejecutadas: {$results['queries_executed']}");
            $this->line(" URLs encontradas: {$results['urls_found']}");
            $this->line(" Dominios evaluados: {$results['domains_evaluated']}");
            $this->line(" Tiendas compatibles detectadas: {$results['stores_compatible']}");
            $this->info(" 🎉 Nuevas tiendas registradas: {$results['new_stores_registered']}");
            $this->info(" 📦 Nuevos productos sincronizados: {$results['new_products_synced']}");

            if (!empty($results['discovered_stores'])) {
                $this->table(
                    ['ID', 'Nombre de Tienda', 'País', 'Plataforma', 'URL'],
                    array_map(fn($s) => [$s['id'], $s['name'], $s['country_code'] ?? 'GLOBAL', $s['platform'], $s['url']], $results['discovered_stores'])
                );
            }

            if (!empty($results['errors'])) {
                $this->warn("Errores detectados: " . count($results['errors']));
                foreach (array_slice($results['errors'], 0, 3) as $err) {
                    $this->error("  - {$err}");
                }
            }

            // Liberar memoria para estabilidad a largo plazo
            if (function_exists('gc_collect_cycles')) {
                gc_collect_cycles();
            }

            if ($isDaemon) {
                $this->comment("\nCiclo completado. Esperando {$interval} segundos antes del siguiente ciclo...");
                $cycle++;
                sleep($interval);
            }
        } while ($isDaemon);

        return Command::SUCCESS;
    }
}
