<?php

namespace App\Console\Commands;

use App\Services\Scraper\Services\PriceAvailabilityMonitorService;
use Illuminate\Console\Command;

class CheckOffersPriceAndStockCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'offers:check-prices 
                            {--store=all : Slug de la tienda a verificar (ej: locatel, farmahorro, dermopascua, all)}
                            {--limit=50 : Cantidad máxima de ofertas a auditar en esta pasada}
                            {--stale-hours=2 : Verificar solo ofertas no auditadas en las últimas X horas (0 para desactivar)}
                            {--force : Forzar revisión de todas las ofertas registradas sin importar cuándo se auditaron}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Monitorea ofertas existentes en la BDD para detectar variaciones de precio (aumentos/descuentos) y disponibilidad de stock.';

    /**
     * Execute the console command.
     */
    public function handle(PriceAvailabilityMonitorService $monitorService): int
    {
        $store = $this->option('store');
        $limit = (int) $this->option('limit');
        $staleHours = (int) $this->option('stale-hours');
        $force = (bool) $this->option('force');

        $this->info("===================================================================");
        $this->info(" 🔍 Allabout.skin - Monitor Ligero de Precios y Disponibilidad");
        $this->info("===================================================================");
        $this->line("Tienda: <comment>{$store}</comment> | Límite: <comment>{$limit}</comment> | Horas sin auditar: <comment>" . ($force ? 'IGNORADO (Forzado)' : ">= {$staleHours}h") . "</comment>");
        $this->newLine();

        $rows = [];

        $stats = $monitorService->checkBatch(
            storeSlug: $store,
            limit: $limit,
            staleHours: $staleHours,
            forceAll: $force,
            progressCallback: function ($result, $currentStats) use (&$rows) {
                $changeIcon = '➖';
                $changeText = 'Estable';
                $diffText = '$0.00';

                if ($result['change_type'] === 'INCREASE') {
                    $changeIcon = '🔺';
                    $changeText = "Subió (+{$result['percentage_change']}%)";
                    $diffText = "+$" . number_format($result['difference_usd'], 2);
                } elseif ($result['change_type'] === 'DECREASE') {
                    $changeIcon = '🔻';
                    $changeText = "Bajó ({$result['percentage_change']}%)";
                    $diffText = "-$" . number_format(abs($result['difference_usd']), 2);
                } elseif ($result['change_type'] === 'OUT_OF_STOCK') {
                    $changeIcon = '🚫';
                    $changeText = 'Se agotó';
                } elseif ($result['change_type'] === 'RESTOCKED') {
                    $changeIcon = '✨';
                    $changeText = 'Reabastecido';
                } elseif (($result['status'] ?? '') === 'unreachable') {
                    $changeIcon = '⚠️';
                    $changeText = 'No respondió';
                }

                $rows[] = [
                    $result['offer_id'],
                    mb_strimwidth($result['product_name'] ?? 'N/A', 0, 32, '...'),
                    $result['store_name'] ?? 'Tienda',
                    $result['is_in_stock'] ? '<info>En Stock</info>' : '<error>Agotado</error>',
                    '$' . number_format($result['old_price_usd'], 2),
                    '$' . number_format($result['new_price_usd'], 2),
                    "{$changeIcon} {$changeText} ({$diffText})",
                ];

                $this->line(" [{$currentStats['total_processed']}/{$this->option('limit')}] Oferta #{$result['offer_id']}: {$result['product_name']} -> {$changeIcon} {$changeText}");
            }
        );

        $this->newLine();
        $this->info("===================================================================");
        $this->info(" 📊 Resumen de Auditoría de Precios y Stock");
        $this->info("===================================================================");
        $this->line(" Total ofertas auditadas: <comment>{$stats['total_processed']}</comment>");
        $this->line(" 🔺 Precios que subieron: <comment>{$stats['price_increases']}</comment>");
        $this->line(" 🔻 Precios que bajaron (Descuentos): <comment>{$stats['price_decreases']}</comment>");
        $this->line(" ✨ Productos reabastecidos: <comment>{$stats['restocked']}</comment>");
        $this->line(" 🚫 Productos agotados: <comment>{$stats['out_of_stock']}</comment>");
        $this->line(" ➖ Precios sin variación: <comment>{$stats['unchanged']}</comment>");
        if ($stats['errors'] > 0) {
            $this->error(" ⚠️ Errores de conexión: {$stats['errors']}");
        }
        $this->info("===================================================================");

        if (!empty($rows)) {
            $this->newLine();
            $this->table(
                ['ID', 'Producto', 'Tienda', 'Stock', 'Precio Previo', 'Precio Actual', 'Variación'],
                array_slice($rows, 0, 15)
            );
        }

        return self::SUCCESS;
    }
}
