<?php

namespace App\Console\Commands;

use App\Services\Scraper\Services\CrawlerSummaryService;
use Illuminate\Console\Command;

class CrawlerSummaryCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'crawler:summary 
                            {--hours=24 : Ventana de tiempo en horas a resumir (ej: 2, 12, 24)}
                            {--json : Mostrar la salida en formato JSON en vez de tablas ASCII}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Genera un resumen ejecutivo del estado, métricas, rendimiento y anomalías del crawler y monitor de precios.';

    /**
     * Execute the console command.
     */
    public function handle(CrawlerSummaryService $summaryService): int
    {
        $hours = (int) $this->option('hours');
        if ($hours <= 0) {
            $hours = 24;
        }

        $summary = $summaryService->generate($hours);

        if ($this->option('json')) {
            $this->line(json_encode($summary, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
            return self::SUCCESS;
        }

        $this->newLine();
        $this->info("==================================================================================");
        $this->info(" 📊 ALLABOUT.SKIN - RESUMEN EJECUTIVO DEL CRAWLER & MERCADO");
        $this->info("==================================================================================");
        $this->line(" Ventana analizada: <comment>Últimas {$hours} horas</comment> | Generado: <comment>{$summary['summary_meta']['generated_human']}</comment>");
        $this->line(" Frecuencia del Cron: <comment>{$summary['summary_meta']['cron_schedule']}</comment>");
        $this->line(" Estado de Salud: " . $this->formatHealthBadge($summary['health']['status'], $summary['health']['badge']) . " (Score: {$summary['health']['score']}/100)");
        $this->line(" Diagnóstico: <comment>{$summary['health']['message']}</comment>");
        $this->info("----------------------------------------------------------------------------------");

        // 1. KPIs Clave
        $kpis = $summary['kpis'];
        $this->table(
            ['Métrica Principal', 'Valor'],
            [
                ['Total Ofertas en PostgreSQL', number_format($kpis['total_offers']) . ' productos'],
                ['Ofertas en Stock Disponible', number_format($kpis['in_stock_offers']) . " ({$kpis['stock_rate_percentage']}%)"],
                ['Ofertas Agotadas', number_format($kpis['out_of_stock_offers'])],
                ["Nuevas Ofertas Descubiertas (Últimas {$hours}h)", '+' . number_format($kpis['new_offers_period'])],
                ["Ofertas Actualizadas / Auditadas (Últimas {$hours}h)", number_format($kpis['updated_offers_period'])],
                ['Variaciones de Precio Registradas', "🔺 {$kpis['price_increases_period']} alzas | 🔻 {$kpis['price_decreases_period']} descuentos"],
                ['Ingredientes Activos Clínicos', "{$kpis['crawled_ingredients_period']}/{$kpis['total_active_ingredients']} escaneados ({$kpis['coverage_rate_percentage']}%)"],
            ]
        );

        // 2. Estado de Tiendas
        $this->newLine();
        $this->info(" 🏪 Rendimiento por Cadena Comercial:");
        $storeRows = [];
        foreach ($summary['stores'] as $store) {
            $statusText = $store['crawler_enabled'] ? '<info>Auto (' . $store['platform'] . ')</info>' : '<comment>Manual</comment>';
            $storeRows[] = [
                $store['name'],
                $store['slug'],
                $statusText,
                number_format($store['total_offers']),
                '+' . number_format($store['new_offers_period']),
                $store['last_crawled_human'],
            ];
        }
        $this->table(
            ['Tienda', 'Slug', 'Modo Crawler', 'Total Ofertas', "Nuevas ({$hours}h)", 'Último Rastreo'],
            $storeRows
        );

        // 3. Calidad Clínica & Quality Gate
        $diag = $summary['execution_diagnostics'];
        $this->newLine();
        $this->info(" 🔬 Métricas del Clinical Quality Gate (Filtro Antibasura):");
        $this->line(" -> Total Evaluados: <comment>{$diag['total_evaluated_quality_gate']}</comment>");
        $this->line(" -> Aprobados (Alta Relevancia Tópica): <info>{$diag['total_accepted_quality_gate']}</info>");
        $this->line(" -> Rechazados (No cosméticos / suplementos): <comment>{$diag['total_rejected_quality_gate']}</comment>");
        $this->line(" -> Nuevas Ofertas Sincronizadas: <info>{$diag['total_new_offers_synced']}</info>");

        // 4. Próximos Activos en Cola Round-Robin
        if (!empty($summary['next_queue'])) {
            $this->newLine();
            $this->info(" ⏳ Próximos Activos en Cola Round-Robin:");
            $queueRows = [];
            foreach ($summary['next_queue'] as $q) {
                $queueRows[] = [
                    $q['id'],
                    $q['inci_name'],
                    $q['common_name'] ?? 'N/A',
                    $q['last_crawled_human'],
                ];
            }
            $this->table(['ID', 'INCI Name', 'Nombre Común', 'Último Rastreo'], $queueRows);
        }

        // 5. Variaciones de Precios Recientes
        if (!empty($summary['recent_price_changes'])) {
            $this->newLine();
            $this->info(" 🏷️ Variaciones de Precio Recientes Detectadas:");
            $priceRows = [];
            foreach ($summary['recent_price_changes'] as $pch) {
                $diffSign = $pch['difference_usd'] > 0 ? "+$" : "-$";
                $pctSign = $pch['difference_usd'] > 0 ? "+" : "";
                $priceRows[] = [
                    mb_strimwidth($pch['product_name'], 0, 30, '...'),
                    $pch['store_name'],
                    '$' . number_format($pch['old_price_usd'], 2),
                    '$' . number_format($pch['new_price_usd'], 2),
                    "{$diffSign}" . number_format(abs($pch['difference_usd']), 2) . " ({$pctSign}{$pch['percentage_change']}%)",
                    $pch['recorded_at'],
                ];
            }
            $this->table(['Producto', 'Tienda', 'Precio Ant.', 'Precio Act.', 'Variación', 'Detectado'], $priceRows);
        }

        // 6. Alertas / Anomalías
        if (!empty($diag['detected_anomalies'])) {
            $this->newLine();
            $this->warn(" ⚠️ Anomalías o Advertencias Detectadas:");
            foreach ($diag['detected_anomalies'] as $anomaly) {
                $this->line("  • <fg=yellow>{$anomaly}</>");
            }
        }

        // 7. Recomendaciones y Optimizaciones
        $this->newLine();
        $this->info(" 💡 Optimizaciones Activas & Recomendaciones:");
        foreach ($summary['recommendations'] as $rec) {
            $this->line("  ✓ {$rec}");
        }

        $this->info("==================================================================================");
        $this->newLine();

        return self::SUCCESS;
    }

    protected function formatHealthBadge(string $status, string $badge): string
    {
        return match ($status) {
            'OPERATIONAL' => "<info>{$badge}</info>",
            'ATTENTION' => "<comment>{$badge}</comment>",
            'CRITICAL' => "<error>{$badge}</error>",
            default => $badge,
        };
    }
}
