<?php

namespace App\Console\Commands;

use App\Services\Scraper\Contracts\StoreScraperInterface;
use App\Services\Scraper\Drivers\FarmahorroScraper;
use App\Services\Scraper\Drivers\FarmatodoGenericScraper;
use App\Services\Scraper\Drivers\GenericWebPageScraper;
use App\Services\Scraper\Drivers\LocatelScraper;
use App\Services\Scraper\Geocoding\NominatimGeocodingService;
use App\Services\Scraper\Pipeline\OfferSyncService;
use App\Services\Scraper\Services\SocialCommerceParserService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class RunStoreScraperCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'scraper:run 
                            {--store=all : Clave de la cadena a scrapear (farmatodo, locatel, farmahorro, all)}
                            {--city= : Filtrar sucursales por ciudad (ej: "Valle de la Pascua", "Caracas")}
                            {--url= : URL directa de una página de producto o tienda a scrapear como objetivo}
                            {--social-text= : Texto o caption de post de Instagram, WhatsApp o red social a procesar}
                            {--social-store= : Nombre o slug de la tienda de Instagram/redes si no se detecta @}
                            {--ingredient= : Nombre o ID de un componente/activo dermatológico a rastrear en el mercado}
                            {--by-active-ingredients : Rastrear productos en el mercado para todos los ingredientes activos con estudios clínicos}
                            {--skip-existing : Omitir URLs de productos que ya se encuentren registradas (activo por defecto)}
                            {--force : Desactivar omisión y forzar re-procesamiento de URLs existentes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Ejecuta el rastreo automatizado de tiendas, sucursales físicas, productos, precios, URLs o por componentes con estudios clínicos.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $urlOption = $this->option('url');
        $storeOption = strtolower($this->option('store') ?? 'all');
        $cityOption = $this->option('city');
        $ingredientOption = $this->option('ingredient');
        $byActiveIngredients = $this->option('by-active-ingredients');
        $force = (bool) $this->option('force');
        $skipExisting = !$force; // Por defecto siempre omitimos URLs ya registradas en descubrimiento

        $this->info("=================================================");
        $this->info(" 🛒 Allabout.skin - Motor de Scraping Científico");
        $this->info("=================================================");
        if ($skipExisting) {
            $this->line(" ⚡ Modo Eficiente: Omitiendo URLs ya registradas (descubriendo solo productos nuevos).");
        } else {
            $this->line(" ⚠️ Modo Forzado: Re-procesando todas las URLs encontradas.");
        }

        $geocodingService = new NominatimGeocodingService();
        $syncService = new OfferSyncService($geocodingService);

        // MODO 1: RASTREO POR INGREDIENTE O COMPONENTES CON ESTUDIOS
        if (!empty($ingredientOption) || $byActiveIngredients) {
            $ingredientService = new \App\Services\Scraper\Services\IngredientMarketScraperService($syncService, $geocodingService);

            if ($byActiveIngredients) {
                $this->info("🔬 Modo Rastreo Científico: Escaneando mercado para TODOS los activos con estudios clínicos");
                $summary = $ingredientService->scrapeAllActiveIngredients($cityOption, $skipExisting);

                $this->newLine();
                $this->info("=================================================");
                $this->info(" ✅ Rastreo por componentes finalizado!");
                $this->info(" Componentes analizados: " . $summary['total_ingredients_scanned']);
                $this->info(" Productos nuevos descubiertos y vinculados: " . $summary['total_market_products_discovered']);
                $this->info(" URLs existentes omitidas (sin re-descarga innecesaria): " . ($summary['total_existing_urls_skipped'] ?? 0));
                $this->info("=================================================");

                return self::SUCCESS;
            }

            // Ingrediente específico: búsqueda flexible por INCI, nombre común, alias o raíz lingüística
            $cleanTerm = trim(preg_replace('/[aeiouáéíóú]$/ui', '', $ingredientOption));
            $ingredient = \App\Models\Ingredient::where('id', is_numeric($ingredientOption) ? $ingredientOption : null)
                ->orWhere('inci_name', 'ILIKE', "%{$ingredientOption}%")
                ->orWhere('inci_name', 'ILIKE', "%{$cleanTerm}%")
                ->orWhere('common_name', 'ILIKE', "%{$ingredientOption}%")
                ->orWhere('common_name', 'ILIKE', "%{$cleanTerm}%")
                ->orWhereHas('aliases', fn($q) => $q->where('alias', 'ILIKE', "%{$ingredientOption}%"))
                ->first();

            if (!$ingredient) {
                $this->error("No se encontró el ingrediente '{$ingredientOption}' en la base de datos.");
                return self::FAILURE;
            }

            $this->info("🔬 Buscando en el mercado productos formulados con: {$ingredient->inci_name} ({$ingredient->common_name})");
            $res = $ingredientService->scrapeForIngredient($ingredient, $cityOption, $skipExisting);

            $this->newLine();
            $this->info("✅ ¡Rastreo completado para {$ingredient->inci_name}!");
            $this->line(" Productos nuevos descubiertos: <comment>{$res['products_discovered']}</comment>");
            $this->line(" URLs existentes omitidas: <comment>{$res['urls_skipped_existing']}</comment>");
            $this->line(" Ofertas sincronizadas: <comment>{$res['synced_offers']}</comment>");

            return self::SUCCESS;
        }

        // MODO 2: RASTREO DE UNA URL ESPECÍFICA COMO OBJETIVO
        if (!empty($urlOption)) {
            $this->info("🎯 Objetivo específico por URL: {$urlOption}");
            $this->line(" -> Conectando y analizando metadatos (OpenGraph, Schema.org JSON-LD)...");

            $urlScraper = new GenericWebPageScraper();
            $offerDto = $urlScraper->scrapeUrl($urlOption);

            if (!$offerDto) {
                $errorMsg = "No se pudieron extraer datos válidos del producto desde la URL: {$urlOption}. Revisa los logs en storage/logs/laravel.log.";
                $this->error($errorMsg);
                Log::channel('single')->error("[Scraper CLI] {$errorMsg}");
                return self::FAILURE;
            }

            $savedOffer = $syncService->syncOffer($offerDto);

            $this->newLine();
            $this->info("✅ ¡Producto extraído y persistido en PostgreSQL!");
            $this->table(
                ['Campo', 'Valor Extraído'],
                [
                    ['Tienda / Slug', $offerDto->storeSlug],
                    ['Producto', $offerDto->productName],
                    ['Marca', $offerDto->brandName ?? 'Sin marca'],
                    ['Precio USD', '$' . number_format($offerDto->price, 2) . ' USD'],
                    ['Precio VES', 'Bs. ' . number_format($offerDto->priceVes ?? 0, 2) . ' VES'],
                    ['Disponibilidad', $offerDto->inStock ? 'En Stock' : 'Agotado'],
                    ['ID Oferta en BDD', $savedOffer?->id ?? 'N/A'],
                ]
            );

            return self::SUCCESS;
        }

        // MODO 3: INGESTIÓN DE POST SOCIAL (INSTAGRAM / WHATSAPP / REDES)
        $socialTextOption = $this->option('social-text');
        if (!empty($socialTextOption)) {
            $this->info("📱 Modo Comercio Social: Analizando post de Instagram / WhatsApp...");
            $socialStoreOption = $this->option('social-store');

            $socialParser = new SocialCommerceParserService();
            $result = $socialParser->parsePostText($socialTextOption, $socialStoreOption);
            $offerDto = $result['dto'];
            $meta = $result['metadata'];
            $auth = $result['authenticity'];

            // Filtro de Seguridad Anti-Bot / Anti-Cuentas Foráneas o Desactualizadas
            if (!$result['is_valid'] && !$force) {
                $this->newLine();
                $this->error("🛑 Post RECHAZADO por el Filtro de Autenticidad y Calidad de Allabout.skin");
                $this->line(" Estado: <fg=red>{$auth['status']}</> | Score de Confianza: <comment>{$auth['trust_score']}/100</comment>");
                foreach ($auth['reasons'] as $r) {
                    $this->line(" ❌ {$r}");
                }
                $this->line(" (Para forzar el registro de todas formas, usa la bandera --force)");
                return self::FAILURE;
            }

            $savedOffer = $syncService->syncOffer($offerDto);

            $this->newLine();
            $this->info("✅ ¡Post verificado y oferta persistida en PostgreSQL!");
            $this->table(
                ['Campo Detectado', 'Valor Extraído'],
                [
                    ['Tienda / Identificador', $meta['store_slug']],
                    ['Usuario Instagram', $meta['instagram_handle'] ? '@' . $meta['instagram_handle'] : 'No especificado'],
                    ['Producto Detectado', $meta['product_name']],
                    ['Marca Identificada', $meta['brand']],
                    ['Categoría Cosmética', $meta['category']],
                    ['Precio USD (Ref)', '$' . number_format($meta['price_usd'], 2) . ' USD'],
                    ['Precio VES Estimado', 'Bs. ' . number_format($meta['price_ves'] ?? 0, 2) . ' VES'],
                    ['Ciudad / Despacho', $meta['city'] ?? 'Nivel Nacional'],
                    ['WhatsApp Contacto', $meta['whatsapp'] ?? 'No detectado'],
                    ['Métodos de Pago', !empty($meta['payment_methods']) ? implode(', ', $meta['payment_methods']) : 'Estandar'],
                    ['Score de Confianza', "{$meta['trust_score']}/100 [{$meta['verification_status']}]"],
                    ['Disponibilidad', $meta['in_stock'] ? 'Disponible' : 'Agotado'],
                    ['ID Oferta en BDD', $savedOffer?->id ?? 'N/A'],
                ]
            );

            return self::SUCCESS;
        }

        // MODO 4: RASTREO POR CADENA O TODAS LAS TIENDAS
        $this->line("Tienda: <comment>{$storeOption}</comment> | Ciudad: <comment>" . ($cityOption ?? 'Todas') . "</comment>");

        /** @var array<string, StoreScraperInterface> $availableDrivers */
        $availableDrivers = [
            'farmatodo' => new FarmatodoGenericScraper(),
            'locatel' => new LocatelScraper(),
            'farmahorro' => new FarmahorroScraper(),
        ];

        $driversToRun = [];
        if ($storeOption === 'all') {
            $driversToRun = $availableDrivers;
        } elseif (isset($availableDrivers[$storeOption])) {
            $driversToRun[$storeOption] = $availableDrivers[$storeOption];
        } else {
            $this->error("El scraper para '{$storeOption}' no está registrado.");
            $this->line("Disponibles: " . implode(', ', array_keys($availableDrivers)));
            return self::FAILURE;
        }

        $totalBranches = 0;
        $totalOffers = 0;

        foreach ($driversToRun as $key => $scraper) {
            $this->newLine();
            $this->info("🔍 Rastreador activo: {$scraper->getStoreName()} [{$key}]");

            // 1. Sincronizar sucursales físicas
            $this->line(" -> Rastreando sucursales y coordenadas geográficas...");
            try {
                $branches = $scraper->scrapeBranches($cityOption);
                $branchCount = 0;
                foreach ($branches as $branchDto) {
                    $savedBranch = $syncService->syncBranch($branchDto);
                    if ($savedBranch) {
                        $branchCount++;
                    }
                }
                $this->line("    ✅ {$branchCount} sucursales sincronizadas en base de datos.");
                $totalBranches += $branchCount;
            } catch (\Throwable $e) {
                $this->error("    ❌ Error al sincronizar sucursales de {$key}: " . $e->getMessage());
                Log::channel('single')->error("Scraper Error [Branches {$key}]: " . $e->getMessage());
            }

            // 2. Sincronizar ofertas de productos y precios
            $this->line(" -> Rastreando catálogo de productos y precios...");
            try {
                $offers = $scraper->scrapeProductOffers();
                $offerCount = 0;
                foreach ($offers as $offerDto) {
                    $savedOffer = $syncService->syncOffer($offerDto);
                    if ($savedOffer) {
                        $offerCount++;
                    }
                }
                $this->line("    ✅ {$offerCount} ofertas de productos sincronizadas.");
                $totalOffers += $offerCount;
            } catch (\Throwable $e) {
                $this->error("    ❌ Error al sincronizar ofertas de {$key}: " . $e->getMessage());
                Log::channel('single')->error("Scraper Error [Offers {$key}]: " . $e->getMessage());
            }
        }

        $this->newLine();
        $this->info("=================================================");
        $this->info(" 🎉 Scraping completado con éxito!");
        $this->info(" Sucursales procesadas: {$totalBranches}");
        $this->info(" Precios y ofertas persistidos en PostgreSQL: {$totalOffers}");
        $this->info("=================================================");

        return self::SUCCESS;
    }
}
