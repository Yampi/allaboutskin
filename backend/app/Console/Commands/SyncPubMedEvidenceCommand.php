<?php

namespace App\Console\Commands;

use App\Domain\Evidence\Services\PubMedApiService;
use App\Domain\Evidence\Services\EvidenceGradeCalculator;
use App\Models\Ingredient;
use App\Models\PubMedStudy;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class SyncPubMedEvidenceCommand extends Command
{
    protected $signature = 'evidence:sync-pubmed
        {--all : Incluir ingredientes que ya tienen estudios}
        {--include-inactive : Incluir ingredientes no activos (excipientes)}
        {--only= : Nombres INCI separados por coma (solo esos ingredientes)}
        {--replace : Descarta los estudios vinculados antes de buscar de nuevo}
        {--titles : Muestra el título de cada estudio encontrado}
        {--limit= : Máximo de ingredientes a procesar}
        {--max-results=4 : Estudios máximos por ingrediente}
        {--delay= : Milisegundos de pausa entre ingredientes (por defecto según NCBI_API_KEY)}
        {--dry-run : Solo lista los ingredientes que se procesarían, sin llamar a PubMed}';

    protected $description = 'Busca en PubMed los estudios de cada ingrediente y recalcula su nivel de evidencia';

    public function handle(PubMedApiService $pubMed, EvidenceGradeCalculator $calculator): int
    {
        $query = Ingredient::query()->orderBy('id');

        if (!$this->option('include-inactive')) {
            $query->where('is_active', true);
        }
        if ($this->option('only')) {
            $names = array_map(fn ($n) => strtoupper(trim($n)), explode(',', $this->option('only')));
            $query->whereIn('inci_name', $names);
        }
        if (!$this->option('all') && !$this->option('only')) {
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
        $titles = [];
        $bar = $this->output->createProgressBar($total);
        foreach ($query->lazyById(20) as $ingredient) {
            // searchAndSyncStudies cachea 7 días; se limpia para forzar la consulta real.
            Cache::forget("pubmed_studies_ingredient_{$ingredient->id}");
            if ($this->option('replace')) {
                $ingredient->pubmedStudies()->detach();
            }
            $studies = $pubMed->searchAndSyncStudies($ingredient, $maxResults);
            $grade = $calculator->refresh($ingredient);

            $rows[] = [$ingredient->inci_name, count($studies), $grade ?? '—'];
            if ($this->option('titles')) {
                foreach ($studies as $study) {
                    $titles[] = "{$ingredient->inci_name} [{$study->evidence_grade}] " . mb_substr($study->title, 0, 120);
                }
            }
            $bar->advance();

            if ($delayMs > 0) {
                usleep($delayMs * 1000);
            }
        }
        $bar->finish();
        $this->newLine(2);

        $this->table(['Ingrediente', 'Estudios', 'Evidencia'], $rows);
        foreach ($titles as $line) {
            $this->line($line);
        }
        if ($this->option('replace')) {
            // Estudios que ya no pertenecen a ningún ingrediente tras el reemplazo.
            PubMedStudy::whereDoesntHave('ingredients')->delete();
        }
        $without = count(array_filter($rows, fn ($r) => $r[1] === 0));
        $this->info('Con estudios: ' . (count($rows) - $without) . " | Sin resultados (o error de PubMed): {$without}");

        return Command::SUCCESS;
    }
}
