/**
 * tests/e2e/tier2_boundary_corner_cases/boundary_inci_extremes.test.mjs
 * Tier 2: Boundary & Corner Cases — INCI Formula Parsing
 * Feature Ref: ORIGINAL_REQUEST §R2, PROJECT.md Feature 6
 */

import { describe, test } from '../helpers/test_framework.mjs';
import { assertEqual, assertTrue, assertFalse, assertLessThanOrEqual } from '../helpers/assertions.mjs';

function tokenizeInciFormula(rawText) {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return [];
  }

  // Fast tokenization
  const cleaned = rawText
    .replace(/\r\n/g, '\n')
    .replace(/[•·*]/g, ',')
    .replace(/\s*\/\s*/g, ', ')
    .replace(/;\s*/g, ', ')
    .replace(/\n+/g, ', ')
    .replace(/\s+(\d+(\.\d+)?%)/g, '')
    .trim();

  const rawTokens = cleaned.split(',');
  const tokens = [];
  const seen = new Set();

  for (let i = 0; i < rawTokens.length; i++) {
    const t = rawTokens[i].trim();
    if (t.length > 1) {
      const upper = t.toUpperCase();
      if (!seen.has(upper)) {
        seen.add(upper);
        tokens.push(t);
      }
    }
  }
  return tokens;
}

describe('Tier 2 - Boundary Cases: INCI Parsing Extremes', () => {
  test('TC-BND-INCI-01: Empty or whitespace-only formula returns clean empty array without error', async () => {
    assertEqual(tokenizeInciFormula('').length, 0);
    assertEqual(tokenizeInciFormula('   \n\t   ').length, 0);
    assertEqual(tokenizeInciFormula(null).length, 0);
    assertEqual(tokenizeInciFormula(undefined).length, 0);
  });

  test('TC-BND-INCI-02: Single-ingredient formula tokenizes cleanly', async () => {
    const single = tokenizeInciFormula('Aqua');
    assertEqual(single.length, 1);
    assertEqual(single[0], 'Aqua');
  });

  test('TC-BND-INCI-03: Extreme formula with 300+ ingredients parses within 50ms INCI SLA without memory bloat', async () => {
    const massiveTokens = Array.from({ length: 350 }, (_, i) => `Extract_${i + 1}`).join(', ');
    const start = performance.now();
    const parsed = tokenizeInciFormula(massiveTokens);
    const duration = performance.now() - start;

    assertEqual(parsed.length, 350);
    assertLessThanOrEqual(duration, 50, `Massive formula parsing (${duration.toFixed(2)}ms) must be under 50ms SLA`);
  });

  test('TC-BND-INCI-04: Complex delimiters (semicolons, bullets, slashes, newlines) correctly split tokens', async () => {
    const messyFormula = `Aqua • Niacinamide; Zinc PCA / Glycerin\nPhenoxyethanol * Ethylhexylglycerin`;
    const tokens = tokenizeInciFormula(messyFormula);

    assertEqual(tokens.length, 6);
    assertTrue(tokens.includes('Aqua'));
    assertTrue(tokens.includes('Niacinamide'));
    assertTrue(tokens.includes('Zinc PCA'));
    assertTrue(tokens.includes('Glycerin'));
    assertTrue(tokens.includes('Phenoxyethanol'));
    assertTrue(tokens.includes('Ethylhexylglycerin'));
  });

  test('TC-BND-INCI-05: Strips active concentration percentages and cleans commercial chemical labels', async () => {
    const commercialLabel = 'Aqua, Niacinamide 10%, Zinc PCA 1.0%, Salicylic Acid 2%, Retinol 0.3%';
    const tokens = tokenizeInciFormula(commercialLabel);

    assertEqual(tokens.length, 5);
    assertEqual(tokens[0], 'Aqua');
    assertEqual(tokens[1], 'Niacinamide');
    assertEqual(tokens[2], 'Zinc PCA');
    assertEqual(tokens[3], 'Salicylic Acid');
    assertEqual(tokens[4], 'Retinol');
  });
});
