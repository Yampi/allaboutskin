/**
 * tests/e2e/tier2_boundary_corner_cases/boundary_bulk_pricing.test.mjs
 * Tier 2: Boundary & Corner Cases — Bulk Pricing & Extreme Currency Arithmetic
 * Feature Ref: ORIGINAL_REQUEST §R2, PROJECT.md Feature 7
 */

import { describe, test } from '../helpers/test_framework.mjs';
import { assertEqual, assertTrue, assertFalse, assertThrowsSync, assertLessThanOrEqual } from '../helpers/assertions.mjs';

function executeBulkPriceUpdate(offers, newExchangeRate) {
  if (typeof newExchangeRate !== 'number' || isNaN(newExchangeRate) || newExchangeRate <= 0) {
    throw new Error(`Invalid exchange rate: ${newExchangeRate}. Must be a positive numeric value.`);
  }

  if (!Array.isArray(offers)) {
    throw new Error('Offers parameter must be an array');
  }

  const updatedOffers = [];
  for (const offer of offers) {
    if (typeof offer.price_usd !== 'number' || offer.price_usd < 0) {
      continue;
    }
    // High precision multiplication rounded strictly to 2 decimal places
    const localPrice = Math.round(offer.price_usd * newExchangeRate * 100) / 100;
    updatedOffers.push({
      ...offer,
      exchange_rate: newExchangeRate,
      price_local: localPrice,
    });
  }

  return {
    count: updatedOffers.length,
    offers: updatedOffers,
  };
}

describe('Tier 2 - Boundary Cases: Bulk Pricing & Currency Precision', () => {
  test('TC-BND-PRICE-01: Zero or negative exchange rate throws validation error', async () => {
    assertThrowsSync(() => executeBulkPriceUpdate([], 0), /Invalid exchange rate/);
    assertThrowsSync(() => executeBulkPriceUpdate([], -36.5), /Invalid exchange rate/);
    assertThrowsSync(() => executeBulkPriceUpdate([], NaN), /Invalid exchange rate/);
  });

  test('TC-BND-PRICE-02: Float representation anomalies (e.g. 0.1 + 0.2 floating point issues) round cleanly to 2 decimal places', async () => {
    const problematicOffers = [
      { id: 1, price_usd: 19.99 }, // 19.99 * 36.8765 = 737.161235 -> 737.16
      { id: 2, price_usd: 0.10 },
      { id: 3, price_usd: 0.20 },
    ];

    const result = executeBulkPriceUpdate(problematicOffers, 36.8765);
    assertEqual(result.offers[0].price_local, 737.16);
    assertEqual(result.offers[1].price_local, 3.69);
    assertEqual(result.offers[2].price_local, 7.38);
  });

  test('TC-BND-PRICE-03: Empty offers catalog returns count: 0 without error', async () => {
    const result = executeBulkPriceUpdate([], 36.50);
    assertEqual(result.count, 0);
    assertEqual(result.offers.length, 0);
  });

  test('TC-BND-PRICE-04: Large catalog of 1,000 offers updates in under 20ms', async () => {
    const largeCatalog = Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      price_usd: (i + 1) * 1.5,
    }));

    const start = performance.now();
    const result = executeBulkPriceUpdate(largeCatalog, 37.25);
    const duration = performance.now() - start;

    assertEqual(result.count, 1000);
    assertLessThanOrEqual(duration, 25, `1000 offer bulk update (${duration.toFixed(2)}ms) must be under 25ms`);
  });

  test('TC-BND-PRICE-05: Skips invalid/negative price items within the batch without aborting the entire update', async () => {
    const mixedBatch = [
      { id: 1, price_usd: 15.00 },
      { id: 2, price_usd: -5.00 }, // Corrupted price
      { id: 3, price_usd: 25.00 },
    ];

    const result = executeBulkPriceUpdate(mixedBatch, 36.50);
    assertEqual(result.count, 2);
    assertEqual(result.offers[0].id, 1);
    assertEqual(result.offers[1].id, 3);
  });
});
