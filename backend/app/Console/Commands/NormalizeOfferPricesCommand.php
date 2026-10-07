<?php

namespace App\Console\Commands;

use App\Models\ProductStoreOffer;
use App\Services\Currency\PriceNormalizerService;
use Illuminate\Console\Command;

class NormalizeOfferPricesCommand extends Command
{
    protected $signature = 'app:normalize-offer-prices {--dry-run : Check without saving changes}';
    protected $description = 'Normaliza todos los precios y divisas de product_store_offers con el estándar de PriceNormalizerService';

    public function handle(PriceNormalizerService $normalizer): int
    {
        $dryRun = $this->option('dry-run');
        $this->info("Iniciando normalización de ofertas..." . ($dryRun ? " (MODO DRY-RUN)" : ""));

        $offers = ProductStoreOffer::with(['store', 'product'])->get();
        $total = $offers->count();
        $repaired = 0;

        foreach ($offers as $offer) {
            $country = $offer->store?->country_code ?? 'VE';
            $oldUsd = (float) $offer->price;
            $oldLocal = (float) ($offer->price_local ?? 0);
            $oldVes = $offer->price_ves !== null ? (float) $offer->price_ves : null;
            $oldCurr = $offer->currency_local;

            $normalized = $normalizer->normalize(
                rawPrice: $oldUsd,
                currency: 'USD',
                countryCode: $country,
                rawVes: $oldVes,
                rawLocal: $oldLocal
            );

            $needsUpdate = false;

            if (abs($oldUsd - $normalized['price_usd']) > 0.01) {
                $needsUpdate = true;
            }
            if (abs($oldLocal - $normalized['price_local']) > 0.05) {
                $needsUpdate = true;
            }
            if ($country === 'VE' && abs(($oldVes ?? 0) - ($normalized['price_ves'] ?? 0)) > 0.05) {
                $needsUpdate = true;
            }
            if ($country !== 'VE' && $oldVes !== null) {
                $needsUpdate = true;
            }
            if ($oldCurr !== $normalized['currency_local']) {
                $needsUpdate = true;
            }

            if ($needsUpdate) {
                $repaired++;
                $this->line(sprintf(
                    "[%s #%d] %s: USD $%.2f -> $%.2f | Local %s %.2f -> %s %.2f | VES %s -> %s (%s)",
                    $country,
                    $offer->id,
                    $offer->product?->name ?? 'Producto',
                    $oldUsd,
                    $normalized['price_usd'],
                    $oldCurr ?? '?',
                    $oldLocal,
                    $normalized['currency_local'],
                    $normalized['price_local'],
                    $oldVes !== null ? number_format($oldVes, 2) : 'null',
                    $normalized['price_ves'] !== null ? number_format($normalized['price_ves'], 2) : 'null',
                    $normalized['source_adjustment']
                ));

                if (!$dryRun) {
                    $offer->update([
                        'price' => $normalized['price_usd'],
                        'price_local' => $normalized['price_local'],
                        'price_ves' => $normalized['price_ves'],
                        'currency' => 'USD',
                        'currency_local' => $normalized['currency_local'],
                    ]);
                }
            }
        }

        $this->info("Proceso completado. {$repaired} de {$total} ofertas normalizadas.");
        return self::SUCCESS;
    }
}
