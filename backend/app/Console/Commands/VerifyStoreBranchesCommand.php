<?php

namespace App\Console\Commands;

use App\Models\StoreBranch;
use App\Services\Geo\BranchVerificationService;
use Illuminate\Console\Command;

class VerifyStoreBranchesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'branches:verify
                            {--store= : Filtrar por slug de cadena (farmatodo, locatel, all)}
                            {--city= : Filtrar por ciudad (ej: "Caracas", "Valle de la Pascua")}
                            {--apply-fixes : Aplicar correcciones sugeridas de coordenadas y direcciones}
                            {--deactivate : Desactivar automáticamente sucursales que no existen o están fuera de la ciudad}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verifica automáticamente la existencia física y la precisión geográfica de las sucursales.';

    /**
     * Execute the console command.
     */
    public function handle(BranchVerificationService $service): int
    {
        $storeOption = $this->option('store');
        $cityOption = $this->option('city');
        $applyFixes = (bool) $this->option('apply-fixes');
        $deactivate = (bool) $this->option('deactivate');

        $this->info("===================================================================");
        $this->info(" 📍 Motor de Verificación y Auditoría Geográfica de Sucursales");
        $this->info("===================================================================");

        $query = StoreBranch::with('store');

        if (!empty($storeOption) && $storeOption !== 'all') {
            $query->whereHas('store', fn($q) => $q->where('slug', $storeOption));
        }

        if (!empty($cityOption)) {
            $query->where('city', 'ILIKE', "%{$cityOption}%");
        }

        $branches = $query->get();

        if ($branches->isEmpty()) {
            $this->warn("No se encontraron sucursales para los filtros especificados.");
            return self::SUCCESS;
        }

        $this->line("Analizando " . $branches->count() . " sucursales...");
        $this->newLine();

        $tableRows = [];
        $verifiedCount = 0;
        $invalidCount = 0;
        $correctedCount = 0;
        $deactivatedCount = 0;

        foreach ($branches as $branch) {
            $storeName = $branch->store?->name ?? 'Tienda';
            $result = $service->verifyBranch($branch);

            $status = $result['status'];
            $isValid = $result['is_valid'];
            $confidence = ($result['confidence'] * 100) . '%';
            $actionTaken = 'Ninguna';

            if ($isValid) {
                $verifiedCount++;
                $branch->is_verified = true;
                $branch->verification_source = $result['provider'] ?? 'VERIFIED';
                $branch->last_verified_at = now();

                if (!empty($result['external_place_id'])) {
                    $branch->external_place_id = $result['external_place_id'];
                }

                if ($applyFixes && !empty($result['suggested_lat']) && !empty($result['suggested_lng'])) {
                    if (isset($result['distance_between_meters']) && $result['distance_between_meters'] > 50) {
                        $branch->latitude = $result['suggested_lat'];
                        $branch->longitude = $result['suggested_lng'];
                        $actionTaken = "Coordenadas corregidas (+/- {$result['distance_between_meters']}m)";
                        $correctedCount++;
                    }
                }

                $branch->save();
            } else {
                $invalidCount++;
                $branch->is_verified = false;

                if ($deactivate) {
                    $branch->is_active = false;
                    $actionTaken = 'DESACTIVADA';
                    $deactivatedCount++;
                }

                $branch->save();
            }

            $tableRows[] = [
                $branch->id,
                $storeName,
                substr($branch->name, 0, 28),
                $branch->city,
                $status,
                $confidence,
                $actionTaken,
            ];
        }

        $this->table(
            ['ID', 'Cadena', 'Sucursal', 'Ciudad', 'Diagnóstico', 'Confianza', 'Acción'],
            $tableRows
        );

        $this->newLine();
        $this->info("===================================================================");
        $this->info(" ✅ Auditoría territorial finalizada!");
        $this->line(" Sucursales válidas y verificadas: <info>{$verifiedCount}</info>");
        $this->line(" Sucursales anómalas / fuera de ciudad / no halladas: <comment>{$invalidCount}</comment>");
        if ($applyFixes) {
            $this->line(" Coordenadas corregidas automáticamente: <info>{$correctedCount}</info>");
        }
        if ($deactivate) {
            $this->line(" Sucursales anómalas desactivadas: <error>{$deactivatedCount}</error>");
        }
        $this->info("===================================================================");

        return self::SUCCESS;
    }
}
