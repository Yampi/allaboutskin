<?php

namespace Tests\Unit;

use App\Services\Currency\ExchangeRateService;
use App\Services\Currency\PriceNormalizerService;
use Tests\TestCase;

class PriceNormalizerServiceTest extends TestCase
{
    protected PriceNormalizerService $normalizer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->normalizer = new PriceNormalizerService();
    }

    public function test_parse_amount_various_formats(): void
    {
        // Formato con coma decimal (común en Latinoamérica y Europa)
        $this->assertEquals(20.00, $this->normalizer->parseAmount('20,00', 'USD'));
        $this->assertEquals(20.00, $this->normalizer->parseAmount('$20,00', 'USD'));
        $this->assertEquals(7.82, $this->normalizer->parseAmount('7,82', 'VES'));

        // Formato con punto decimal
        $this->assertEquals(20.00, $this->normalizer->parseAmount('20.00', 'USD'));
        $this->assertEquals(19.99, $this->normalizer->parseAmount('$19.99', 'USD'));

        // Formato con miles y coma decimal
        $this->assertEquals(17181.20, $this->normalizer->parseAmount('17.181,20', 'VES'));
        $this->assertEquals(17181.20, $this->normalizer->parseAmount('Bs. 17.181,20', 'VES'));

        // Formato anglosajón (coma miles, punto decimal)
        $this->assertEquals(17181.20, $this->normalizer->parseAmount('17,181.20', 'USD'));

        // Monedas de cero decimales (Chile CLP, Colombia COP)
        $this->assertEquals(18500.0, $this->normalizer->parseAmount('18.500', 'CLP', 'CL'));
        $this->assertEquals(18500.0, $this->normalizer->parseAmount('$18.500 CLP', 'CLP', 'CL'));
        $this->assertEquals(85000.0, $this->normalizer->parseAmount('85.000', 'COP', 'CO'));
    }

    public function test_normalize_venezuelan_usd_store(): void
    {
        // En una tienda venezolana de Shopify/WooCommerce que muestra $20,00
        $result = $this->normalizer->normalize(
            rawPrice: '20,00',
            currency: 'USD',
            countryCode: 'VE'
        );

        $this->assertEquals(20.00, $result['price_usd']);
        $this->assertGreaterThan(1000.0, $result['price_local']);
        $this->assertEquals($result['price_local'], $result['price_ves']);
        $this->assertEquals('VES', $result['currency_local']);
        $this->assertTrue($result['is_valid']);
    }

    public function test_normalize_venezuelan_ves_store(): void
    {
        // En una farmacia venezolana (Locatel/Farmahorro) que muestra Bs. 17.181,20
        $result = $this->normalizer->normalize(
            rawPrice: '17.181,20',
            currency: 'VES',
            countryCode: 'VE'
        );

        $this->assertEquals(17181.20, $result['price_local']);
        $this->assertEquals(17181.20, $result['price_ves']);
        $this->assertGreaterThan(15.0, $result['price_usd']);
        $this->assertLessThan(30.0, $result['price_usd']);
        $this->assertEquals('VES', $result['currency_local']);
        $this->assertTrue($result['is_valid']);
    }

    public function test_normalize_repairs_corrupted_ratio(): void
    {
        // Caso exacto del error reportado por el usuario:
        // precio en USD fue calculado como $0.07 debido a un residuo, pero en VES son 17,181.20
        $result = $this->normalizer->normalize(
            rawPrice: 0.07,
            currency: 'USD',
            countryCode: 'VE',
            rawVes: 17181.20
        );

        $this->assertGreaterThan(15.0, $result['price_usd']);
        $this->assertEquals(17181.20, $result['price_local']);
        $this->assertEquals(17181.20, $result['price_ves']);
        $this->assertTrue($result['is_valid']);
    }

    public function test_normalize_international_store_null_ves(): void
    {
        // Tienda de Chile
        $result = $this->normalizer->normalize(
            rawPrice: '18.500',
            currency: 'CLP',
            countryCode: 'CL'
        );

        $this->assertNull($result['price_ves'], 'Tiendas no venezolanas no deben tener price_ves');
        $this->assertEquals(18500.0, $result['price_local']);
        $this->assertEquals('CLP', $result['currency_local']);
        $this->assertGreaterThan(10.0, $result['price_usd']);
        $this->assertTrue($result['is_valid']);
    }
}
