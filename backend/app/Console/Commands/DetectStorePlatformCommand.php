<?php

namespace App\Console\Commands;

use App\Services\Scraper\Services\StorePlatformDetectorService;
use Illuminate\Console\Command;

class DetectStorePlatformCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'store:detect-platform 
                            {url : URL de la tienda o sitio web a analizar}
                            {--json : Mostrar la salida en formato JSON}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Analiza una URL para detectar automáticamente si es Shopify, WooCommerce, VTEX o Schema.org.';

    /**
     * Execute the console command.
     */
    public function handle(StorePlatformDetectorService $detector): int
    {
        $url = $this->argument('url');

        $this->info("🔍 Analizando arquitectura de e-commerce para: {$url} ...");
        $result = $detector->detect($url);

        if ($this->option('json')) {
            $this->line(json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
            return self::SUCCESS;
        }

        $this->newLine();
        $this->info("===================================================================");
        $this->info(" 🌐 DETECCIÓN DE PLATAFORMA DE COMERCIO");
        $this->info("===================================================================");
        $this->line(" URL analizada: <comment>{$result['url']}</comment>");
        $this->line(" Plataforma detectada: <info>{$result['platform']}</info> (Confianza: {$result['confidence']})");
        $this->line(" Compatible con Crawler Automático: " . ($result['is_crawler_ready'] ? '<info>SÍ (Listo para rastreo)</info>' : '<comment>MANUAL / Solo URL directa</comment>'));
        $this->line(" Conector asignado: <comment>{$result['recommended_connector']}</comment>");
        if (!empty($result['signals'])) {
            $this->newLine();
            $this->info(" Señales técnicas identificadas:");
            foreach ($result['signals'] as $sig) {
                $this->line("  ✓ {$sig}");
            }
        }
        $this->info("===================================================================");
        $this->newLine();

        return self::SUCCESS;
    }
}
