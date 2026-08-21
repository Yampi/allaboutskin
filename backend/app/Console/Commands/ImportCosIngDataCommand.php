<?php

namespace App\Console\Commands;

use App\Domain\Cosmetics\Services\CosIngImporterService;
use Illuminate\Console\Command;

class ImportCosIngDataCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cosing:import {--file= : Ruta a un archivo CSV local de CosIng}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Descarga e importa el dataset oficial de cosméticos de la Unión Europea (CosIng)';

    /**
     * Execute the console command.
     */
    public function handle(CosIngImporterService $importer): int
    {
        $this->info('🇪🇺 Iniciando importación del catálogo oficial de cosméticos de la Unión Europea (CosIng)...');

        $filePath = $this->option('file');

        $result = $importer->importDataset($filePath, function ($processed) {
            if ($processed % 50 === 0) {
                $this->output->write(" Procesados: {$processed} ingredientes...\r");
            }
        });

        $this->newLine();
        $this->info("✅ Importación completada con éxito:");
        $this->table(
            ['Métrica', 'Total'],
            [
                ['Total Ingredientes Procesados', $result['total_processed']],
                ['Ingredientes CosIng Importados/Actualizados', $result['imported']],
            ]
        );

        return Command::SUCCESS;
    }
}
