<?php

namespace App\Console\Commands;

use App\Domain\Evidence\Services\PubMedApiService;
use App\Models\Ingredient;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class SyncPubMedEvidenceCommand extends Command
{
    protected $signature = 'evidence:sync-pubmed
        {--all : Incluir ingredientes que ya tienen estudios}
        {--include-inactive : Incluir ingredientes no activos (excipientes)}
        {--limit= : Máximo de ingredientes a procesar}
        {--max-results=4 : Estudios máximos por ingrediente}
        {--delay= : Milisegundos de pausa entre ingredientes (por defecto según NCBI_API_KEY)}
        {--dry-run : Solo lista los ingredientes que se procesarían, sin llamar a PubMed}';

    protected $description = 'Busca en PubMed los estudios de cada ingrediente y recalcula su nivel de evidencia';

    public function handle(PubMedApiService $pubMed): int
    {
        $query = Ingredient::query()->orderBy('id');

        if (!$this->option('include-inactive')) {
            $query->where('is_active', true);
        }
        if (!$this->option('all')) {
            $query->doesntHave('pubmedStudies');
        }
        if ($this->option('limit')) {
            $query->limit((int) $this->option('limit'));
        }

        $total = (clone $query)->count();
        $this->info("Ingredientes a procesar: {$total}");

        if ($this->option('dry-run') || $total === 0) {
            $query->get(['id', 'inci_name'])->each(fn ($i) => $this->line("  - {$i->inci_name}"));

            return Command::SUCCESS;
        }

        // NCBI permite 3 peticiones/s sin clave y 10 con clave; cada ingrediente hace ~5.
        $hasKey = (bool) config('services.ncbi.api_key', env('NCBI_API_KEY'));
        $delayMs = $this->option('delay') !== null ? (int) $this->option('delay') : ($hasKey ? 600 : 2000);
        $maxResults = max(1, (int) $this->option('max-results'));

        $rows = [];
        $bar = $this->output->createProgressBar($total);
        foreach ($query->lazyById(20) as $ingredient) {
            // searchAndSyncStudies cachea 7 días; se limpia para forzar la consulta real.
            Cache::forget("pubmed_studies_ingredient_{$ingredient->id}");
            $studies = $pubMed->searchAndSyncStudies($ingredient, $maxResults);

            $rows[] = [$ingredient->inci_name, count($studies), $ingredient->fresh()->evidence_level ?? '—'];
            $bar->advance();

            if ($delayMs > 0) {
                usleep($delayMs * 1000);
            }
        }
        $bar->finish();
        $this->newLine(2);

        $this->table(['Ingrediente', 'Estudios', 'Evidencia'], $rows);
        $without = count(array_filter($rows, fn ($r) => $r[1] === 0));
        $this->info('Con estudios: ' . (count($rows) - $without) . " | Sin resultados (o error de PubMed): {$without}");

        return Command::SUCCESS;
    }
}
