<?php

namespace Tests\Unit;

use App\Models\AffiliateStore;
use App\Models\Ingredient;
use App\Services\Scraper\Connectors\SchemaOrgConnector;
use App\Services\Scraper\Connectors\ShopifyConnector;
use App\Services\Scraper\Connectors\VtexConnector;
use App\Services\Scraper\Connectors\WooCommerceConnector;
use App\Services\Scraper\Services\MultiStoreCrawlerEngine;
use App\Services\Scraper\Pipeline\OfferSyncService;
use App\Services\Scraper\Quality\ClinicalQualityGateService;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class ScraperHardeningTest extends TestCase
{
    use \Illuminate\Foundation\Testing\RefreshDatabase;

    protected AffiliateStore $store;
    protected Ingredient $ingredient;

    protected function setUp(): void
    {
        parent::setUp();

        $this->store = AffiliateStore::create([
            'name' => 'Farmacia Test Hardening',
            'slug' => 'farmacia-test-hardening',
            'website_url' => 'https://farmacia-test.com',
            'country_code' => 'VE',
            'is_active' => true,
            'crawler_enabled' => true,
            'crawler_platform' => 'WOOCOMMERCE',
        ]);

        $this->ingredient = Ingredient::create([
            'inci_name' => 'NIACINAMIDE',
            'common_name' => 'Niacinamida (Vitamina B3)',
        ]);
    }

    /**
     * Test: WooCommerceConnector does NOT produce fake $15.00 offers when price is missing from HTML.
     */
    public function test_woocommerce_connector_eliminates_hardcoded_15_dollar_fallback(): void
    {
        Http::fake([
            'https://farmacia-test.com/wp-json/wc/store/v1/products*' => Http::response([], 200),
            'https://farmacia-test.com/?s=*' => Http::response('
                <html>
                <body>
                    <ul class="products">
                        <li class="product">
                            <a href="/producto/serum-sin-precio" class="woocommerce-LoopProduct-link">
                                <h2>Serum Niacinamida Sin Precio</h2>
                            </a>
                            <!-- Sin etiqueta de precio -->
                        </li>
                    </ul>
                </body>
                </html>
            ', 200),
        ]);

        $connector = new WooCommerceConnector();
        $offers = $connector->search($this->store, 'niacinamida', $this->ingredient);

        // Sin precio real, la oferta debe ser omitida; NUNCA debe inventarse $15.00
        $this->assertEmpty($offers, 'No se deben generar ofertas con precio inventado de $15.00');
    }

    /**
     * Test: WooCommerceConnector extracts real price when available in WooCommerce markup.
     */
    public function test_woocommerce_connector_extracts_real_price_from_markup(): void
    {
        Http::fake([
            'https://farmacia-test.com/wp-json/wc/store/v1/products*' => Http::response([], 200),
            'https://farmacia-test.com/?s=*' => Http::response('
                <html>
                <body>
                    <ul class="products">
                        <li class="product">
                            <a href="/producto/serum-niacinamida-real" class="woocommerce-LoopProduct-link">
                                <h2>The Ordinary Niacinamide 10%</h2>
                            </a>
                            <span class="price">
                                <span class="woocommerce-Price-amount amount">
                                    <bdi><span class="woocommerce-Price-currencySymbol">$</span>18.50</bdi>
                                </span>
                            </span>
                        </li>
                    </ul>
                </body>
                </html>
            ', 200),
        ]);

        $connector = new WooCommerceConnector();
        $offers = $connector->search($this->store, 'niacinamida', $this->ingredient);

        $this->assertCount(1, $offers);
        $this->assertEquals(18.50, $offers[0]->price);
        $this->assertNotEquals(15.00, $offers[0]->price);
        $this->assertEquals('The Ordinary Niacinamide 10%', $offers[0]->productName);
    }

    /**
     * Test: Connectors retry on HTTP 500/503 and succeed when subsequent attempt recovers.
     */
    public function test_vtex_connector_retries_on_server_error_and_succeeds(): void
    {
        Http::fake([
            'https://farmacia-test.com/api/catalog_system/pub/products/search*' => Http::sequence()
                ->push(['error' => 'temporary backend error'], 503)
                ->push([
                    [
                        'productName' => 'CeraVe Niacinamide Cleanser',
                        'brand' => 'CeraVe',
                        'link' => 'https://farmacia-test.com/cerave-cleanser',
                        'items' => [
                            [
                                'ean' => '7891234567890',
                                'sellers' => [
                                    [
                                        'commertialOffer' => [
                                            'Price' => 1200,
                                            'Tax' => 0,
                                            'AvailableQuantity' => 5,
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ], 200),
        ]);

        $connector = new VtexConnector();
        $offers = $connector->search($this->store, 'niacinamida', $this->ingredient);

        $this->assertCount(1, $offers);
        $this->assertEquals('CeraVe Niacinamide Cleanser', $offers[0]->productName);
    }

    /**
     * Test: Connectors rethrow HTTP 429 so MultiStoreCrawlerEngine can handle Retry-After backoff.
     */
    public function test_connector_rethrows_429_with_retry_after(): void
    {
        Http::fake([
            'https://farmacia-test.com/api/catalog_system/pub/products/search*' => Http::response(
                ['error' => 'Too Many Requests'],
                429,
                ['Retry-After' => '5']
            ),
        ]);

        $connector = new VtexConnector();

        $this->expectException(RequestException::class);
        $connector->search($this->store, 'niacinamida', $this->ingredient);
    }

    /**
     * Test: MultiStoreCrawlerEngine catches 429 and logs Retry-After without crashing.
     */
    public function test_crawler_engine_handles_429_retry_after_gracefully(): void
    {
        Http::fake([
            '*' => Http::response(['error' => 'Rate limit exceeded'], 429, ['Retry-After' => '1']),
        ]);

        $vtex = new VtexConnector();
        $syncService = $this->createMock(OfferSyncService::class);
        $qualityGate = $this->createMock(ClinicalQualityGateService::class);

        $engine = new MultiStoreCrawlerEngine(
            syncService: $syncService,
            qualityGate: $qualityGate,
            vtex: $vtex
        );

        $result = $engine->crawlForIngredient($this->ingredient, true, [$this->store->id]);

        $this->assertIsArray($result);
        $this->assertGreaterThanOrEqual(1, $result['errors_count']);
        $this->assertEquals(0, $result['new_offers_synced']);
    }
}
