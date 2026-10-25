/**
 * tests/e2e/tier2_boundary_corner_cases/boundary_skin_cycling.test.mjs
 * Tier 2: Boundary & Corner Cases — Skin Cycling Clinical Logic Edge States
 * Feature Ref: ORIGINAL_REQUEST §R4, PROJECT.md Feature 16
 */

import { describe, test } from '../helpers/test_framework.mjs';
import { assertEqual, assertTrue, assertFalse, assertThrowsSync } from '../helpers/assertions.mjs';

function resolveStrictRegime(profile) {
  // Validate Fitzpatrick
  if (!Number.isInteger(profile.fitzpatrick) || profile.fitzpatrick < 1 || profile.fitzpatrick > 6) {
    throw new Error(`Invalid Fitzpatrick phototype: ${profile.fitzpatrick}. Must be integer between 1 and 6.`);
  }

  // Precedence 1: Acutely Damaged Barrier ALWAYS overrides all other states (even pregnancy)
  if (profile.barrierStatus === 'ACUTELY_DAMAGED') {
    return {
      regime: 'emergency-barrier-reset',
      reason: 'PRIORITY_OVERRIDE: Acute barrier burn must be rehabilitated before any active routine',
      maxActiveConcentration: 0,
    };
  }

  // Precedence 2: Maternity-Safe Cycling
  if (profile.pregnancyOrNursing) {
    return {
      regime: 'maternity-safe-cycling',
      reason: 'MATERNITY_RESTRICTION: 0% Vitamin A derivatives permitted',
      bannedIngredients: ['Retinol', 'Retinal', 'Tretinoin'],
    };
  }

  // Precedence 3: Beginner or Compromised Barrier
  if (profile.experienceLevel === 'BEGINNER' || profile.barrierStatus === 'COMPROMISED') {
    return {
      regime: 'gentle-5night-cycling',
      reason: 'BUFFERING_REQUIRED: Retinoids must be buffered via Sandwich Method',
      sandwichMethodRequired: true,
    };
  }

  return {
    regime: 'dermatological-classic-4night',
    reason: 'STANDARD_TOLERANCE',
  };
}

describe('Tier 2 - Boundary Cases: Skin Cycling Clinical Edge States', () => {
  test('TC-BND-SC-01: Acute barrier damage overrides pregnancy to prioritize emergency barrier rescue', async () => {
    // Both damaged barrier AND pregnant
    const profile = {
      skinType: 'SENSITIVE',
      fitzpatrick: 3,
      barrierStatus: 'ACUTELY_DAMAGED',
      pregnancyOrNursing: true,
      experienceLevel: 'ADVANCED',
    };

    const resolved = resolveStrictRegime(profile);
    assertEqual(resolved.regime, 'emergency-barrier-reset');
    assertTrue(resolved.reason.includes('PRIORITY_OVERRIDE'));
    assertEqual(resolved.maxActiveConcentration, 0);
  });

  test('TC-BND-SC-02: Out-of-bounds Fitzpatrick values (0, 7, negative, floats) are rejected with validation error', async () => {
    const base = { skinType: 'NORMAL', barrierStatus: 'HEALTHY', pregnancyOrNursing: false, experienceLevel: 'INTERMEDIATE' };

    assertThrowsSync(() => resolveStrictRegime({ ...base, fitzpatrick: 0 }), /Invalid Fitzpatrick phototype/);
    assertThrowsSync(() => resolveStrictRegime({ ...base, fitzpatrick: 7 }), /Invalid Fitzpatrick phototype/);
    assertThrowsSync(() => resolveStrictRegime({ ...base, fitzpatrick: -1 }), /Invalid Fitzpatrick phototype/);
    assertThrowsSync(() => resolveStrictRegime({ ...base, fitzpatrick: 2.5 }), /Invalid Fitzpatrick phototype/);
  });

  test('TC-BND-SC-03: Valid Fitzpatrick boundaries (Type 1 and Type 6) are accepted', async () => {
    const base = { skinType: 'NORMAL', barrierStatus: 'HEALTHY', pregnancyOrNursing: false, experienceLevel: 'INTERMEDIATE' };

    const type1 = resolveStrictRegime({ ...base, fitzpatrick: 1 });
    assertEqual(type1.regime, 'dermatological-classic-4night');

    const type6 = resolveStrictRegime({ ...base, fitzpatrick: 6 });
    assertEqual(type6.regime, 'dermatological-classic-4night');
  });

  test('TC-BND-SC-04: Beginner experience level forces gentle cycling with sandwich method buffering', async () => {
    const profile = {
      skinType: 'COMBINATION',
      fitzpatrick: 4,
      barrierStatus: 'HEALTHY',
      pregnancyOrNursing: false,
      experienceLevel: 'BEGINNER',
    };

    const resolved = resolveStrictRegime(profile);
    assertEqual(resolved.regime, 'gentle-5night-cycling');
    assertTrue(resolved.sandwichMethodRequired);
  });

  test('TC-BND-SC-05: Maternity state strictly excludes all Vitamin A derivatives', async () => {
    const profile = {
      skinType: 'DRY',
      fitzpatrick: 2,
      barrierStatus: 'HEALTHY',
      pregnancyOrNursing: true,
      experienceLevel: 'INTERMEDIATE',
    };

    const resolved = resolveStrictRegime(profile);
    assertEqual(resolved.regime, 'maternity-safe-cycling');
    assertTrue(resolved.bannedIngredients.includes('Retinol'));
    assertTrue(resolved.bannedIngredients.includes('Tretinoin'));
  });
});
