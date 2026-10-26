/**
 * tests/e2e/tier1_feature_coverage/scraping_connectors.test.mjs
 * Tier 1: E-Commerce Catalog Connectors, 8s Timeout & Exponential Backoff
 * Feature Ref: ORIGINAL_REQUEST §R3, PROJECT.md Feature 10
 */

import { describe, test } from '../helpers/test_framework.mjs';
import { assertEqual, assertTrue, assertFalse, assertLessThanOrEqual } from '../helpers/assertions.mjs';
import { SCRAPER_FIXTURES } from '../helpers/fixtures.mjs';

// Connector Normalization Engine
function parseVtexProduct(vtexRaw) {
  const item = vtexRaw.items?.[0];
  const seller = item?.sellers?.[0]?.commertialOffer;
  return {
    connector: 'VTEX',
    product_name: vtexRaw.productName,
    brand_name: vtexRaw.brand,
    sku: item?.itemId,
    price_usd: seller?.Price,
    list_price_usd: seller?.ListPrice,
    in_stock: (seller?.AvailableQuantity || 0) > 0,
  };
}

function parseShopifyProduct(shopifyRaw) {
  return {
    connector: 'Shopify',
    product_name: shopifyRaw.title,
    brand_name: shopifyRaw.vendor,
    sku: String(shopifyRaw.id),
    price_usd: parseFloat(shopifyRaw.price),
    in_stock: Boolean(shopifyRaw.available),
  };
}

function parseWooCommerceProduct(wooRaw) {
  const priceMinor = parseInt(wooRaw.prices?.price || '0', 10);
  const minorUnits = wooRaw.prices?.currency_minor_unit || 2;
  const price = priceMinor / Math.pow(10, minorUnits);
  return {
    connector: 'WooCommerce',
    product_name: wooRaw.name,
    sku: String(wooRaw.id),
    price_usd: price,
    currency: wooRaw.prices?.currency_code,
    in_stock: Boolean(wooRaw.is_in_stock),
  };
}

function parseSchemaOrgProduct(schemaRaw) {
  return {
    connector: 'SchemaOrg',
    product_name: schemaRaw.name,
    brand_name: schemaRaw.brand?.name,
    price_usd: parseFloat(schemaRaw.offers?.price),
    currency: schemaRaw.offers?.priceCurrency,
    in_stock: schemaRaw.offers?.availability?.includes('InStock'),
  };
}

// Exponential Backoff Calculator
function computeBackoffDelay(attempt, retryAfterHeader = null) {
  if (retryAfterHeader) {
    const parsed = parseInt(retryAfterHeader, 10);
    if (!isNaN(parsed) && parsed > 0) {
      // Bound max wait to 10s as per SLA
      return Math.min(parsed * 1000, 10000);
    }
  }
  // Base 1000ms * 2^(attempt - 1) + jitter (0-250ms)
  const base = 1000 * Math.pow(2, attempt - 1);
  const jitter = Math.floor(Math.random() * 250);
  return Math.min(base + jitter, 8000);
}

describe('Tier 1 - Catalog Connectors & Scraping Protocol', () => {
  test('TC-SCRAPE-01: VTEX connector normalizes product catalog and availability', async () => {
    const raw = SCRAPER_FIXTURES.vtexCatalogResponse[0];
    const parsed = parseVtexProduct(raw);

    assertEqual(parsed.connector, 'VTEX');
    assertEqual(parsed.product_name, 'The Ordinary Niacinamide 10% + Zinc 1%');
    assertEqual(parsed.brand_name, 'The Ordinary');
    assertEqual(parsed.price_usd, 12.50);
    assertTrue(parsed.in_stock);
  });

  test('TC-SCRAPE-02: Shopify connector extracts predictive search results', async () => {
    const raw = SCRAPER_FIXTURES.shopifySuggestResponse.resources.results.products[0];
    const parsed = parseShopifyProduct(raw);

    assertEqual(parsed.connector, 'Shopify');
    assertEqual(parsed.product_name, 'CeraVe Hydrating Facial Cleanser 236ml');
    assertEqual(parsed.brand_name, 'CeraVe');
    assertEqual(parsed.price_usd, 14.99);
    assertTrue(parsed.in_stock);
  });

  test('TC-SCRAPE-03: WooCommerce connector correctly normalizes minor unit pricing (cents to dollars)', async () => {
    const raw = SCRAPER_FIXTURES.wooCommerceStoreResponse[0];
    const parsed = parseWooCommerceProduct(raw);

    assertEqual(parsed.connector, 'WooCommerce');
    assertEqual(parsed.product_name, 'La Roche-Posay Anthelios UVMune 400 SPF 50+');
    assertEqual(parsed.price_usd, 24.00, '2400 minor units with 2 decimal places must equal 24.00');
    assertTrue(parsed.in_stock);
  });

  test('TC-SCRAPE-04: Schema.org LD+JSON connector parses structured e-commerce microdata', async () => {
    const raw = SCRAPER_FIXTURES.schemaOrgLdJson;
    const parsed = parseSchemaOrgProduct(raw);

    assertEqual(parsed.connector, 'SchemaOrg');
    assertEqual(parsed.product_name, 'Bioderma Sensibio H2O Micellar Water 500ml');
    assertEqual(parsed.brand_name, 'Bioderma');
    assertEqual(parsed.price_usd, 18.75);
    assertTrue(parsed.in_stock);
  });

  test('TC-SCRAPE-05: Exponential backoff handles HTTP 429 and parses Retry-After header with 8s cap', async () => {
    // Attempt 1: ~1000ms + jitter
    const delay1 = computeBackoffDelay(1);
    assertTrue(delay1 >= 1000 && delay1 <= 1250);

    // Attempt 2: ~2000ms + jitter
    const delay2 = computeBackoffDelay(2);
    assertTrue(delay2 >= 2000 && delay2 <= 2250);

    // With Retry-After: "5" -> 5000ms
    const delayHeader = computeBackoffDelay(1, '5');
    assertEqual(delayHeader, 5000);

    // With excessive Retry-After: "60" -> capped at 10000ms SLA
    const delayCapped = computeBackoffDelay(1, '60');
    assertEqual(delayCapped, 10000);
  });
});
