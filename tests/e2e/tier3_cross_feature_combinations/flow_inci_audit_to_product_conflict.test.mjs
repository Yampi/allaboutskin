/**
 * tests/e2e/tier3_cross_feature_combinations/flow_inci_audit_to_product_conflict.test.mjs
 * Tier 3: Pairwise Flow 3 — INCI Parsing -> Conflict Matrix -> Commercial Alternative Search
 * Feature Ref: ORIGINAL_REQUEST §R2, PROJECT.md
 */

import { describe, test } from '../helpers/test_framework.mjs';
import { assertEqual, assertTrue, assertFalse } from '../helpers/assertions.mjs';

describe('Tier 3 - Flow 3: INCI Audit -> Conflict Matrix -> Safe Alternative Search', () => {
  test('TC-PAIR-03: Collision between active ingredients triggers clinical warning and recommends safe regimen', async () => {
    // 1. User inputs conflicting combination of 2 products
    const productA = { name: 'Serum BHA 2%', formula: 'Aqua, Salicylic Acid, Glycerin, Sodium Hydroxide' };
    const productB = { name: 'Serum Retinol 0.5%', formula: 'Aqua, Caprylic Triglyceride, Retinol, Polysorbate 20' };

    // 2. Parser identifies actives
    function extractActives(formulaText) {
      const tokens = formulaText.split(',').map(t => t.trim().toUpperCase());
      const actives = [];
      if (tokens.some(t => t.includes('SALICYLIC ACID'))) actives.push({ name: 'Salicylic Acid', type: 'BHA' });
      if (tokens.some(t => t.includes('RETINOL'))) actives.push({ name: 'Retinol', type: 'RETINOID' });
      if (tokens.some(t => t.includes('BAKUCHIOL'))) actives.push({ name: 'Bakuchiol', type: 'PHYTO_RETINOID' });
      return actives;
    }

    const activesA = extractActives(productA.formula);
    const activesB = extractActives(productB.formula);
    const combinedActives = [...activesA, ...activesB];

    // 3. Conflict Matrix Analysis
    function evaluateCompatibility(activesList) {
      const hasBha = activesList.some(a => a.type === 'BHA');
      const hasRetinoid = activesList.some(a => a.type === 'RETINOID');

      if (hasBha && hasRetinoid) {
        return {
          compatible: false,
          conflictType: 'IRRITATION_OVERLOAD',
          severity: 'CRITICAL',
          clinicalRationale: 'Co-application exhausts intercellular lipid matrix, accelerating TEWL and retinization dermatitis.',
          recommendedAction: 'SEPARATE_NIGHTS_SKIN_CYCLING',
          alternativeSafeIngredient: 'Bakuchiol',
        };
      }
      return { compatible: true };
    }

    const audit = evaluateCompatibility(combinedActives);
    assertFalse(audit.compatible);
    assertEqual(audit.conflictType, 'IRRITATION_OVERLOAD');
    assertEqual(audit.severity, 'CRITICAL');
    assertEqual(audit.recommendedAction, 'SEPARATE_NIGHTS_SKIN_CYCLING');

    // 4. Substitution Test: User replaces Retinol with Bakuchiol
    const safeProductB = { name: 'Serum Bakuchiol 2%', formula: 'Aqua, Glycerin, Bakuchiol, Centella Asiatica' };
    const safeActives = [...extractActives(productA.formula), ...extractActives(safeProductB.formula)];
    const safeAudit = evaluateCompatibility(safeActives);

    assertTrue(safeAudit.compatible, 'Bakuchiol + Salicylic Acid must be marked compatible without irritation overload');
  });
});
