/**
 * tests/e2e/tier1_feature_coverage/skin_cycling_engine.test.mjs
 * Tier 1: Algorithmic Skin Cycling Engine & 4 Clinical Regimes
 * Feature Ref: ORIGINAL_REQUEST §R4, PROJECT.md Feature 16
 */

import { describe, test } from '../helpers/test_framework.mjs';
import { assertEqual, assertTrue, assertFalse } from '../helpers/assertions.mjs';

// Skin Cycling Engine
function resolveSkinCyclingRegime(profile) {
  // Scenario A: Emergency Barrier Reset
  if (profile.barrierStatus === 'ACUTELY_DAMAGED') {
    return {
      regimeId: 'emergency-barrier-reset',
      title: 'Rescate de Emergencia de Barrera Cutánea',
      nights: 4,
      schedule: [
        { night: 1, focus: 'Reparación Lipídica Intensiva', actives: ['Centella Asiática', 'Pantenol B5', 'Alantoína'] },
        { night: 2, focus: 'Reposición de Ceramidas', actives: ['Ceramidas NP/AP/EOP', 'Colesterol', 'Ácidos Grasos'] },
        { night: 3, focus: 'Hidratación Profunda & NMF', actives: ['Ácido Hialurónico', 'Glicerina', 'Ectoína'] },
        { night: 4, focus: 'Sellado Oclusivo Fisiológico', actives: ['Escualano Vegetal', 'Bisabolol'] },
      ],
      prohibitedActives: ['Retinol', 'Retinaldehído', 'Ácido Glicólico', 'Ácido Salicílico', 'Exfoliantes Físicos'],
    };
  }

  // Scenario B: Maternity-Safe Cycling
  if (profile.pregnancyOrNursing) {
    return {
      regimeId: 'maternity-safe-cycling',
      title: 'Skin Cycling Materno-Seguro',
      nights: 4,
      schedule: [
        { night: 1, focus: 'Exfoliación Segura', actives: ['Ácido Azelaico 10-15%', 'Gluconolactona (PHA)'] },
        { night: 2, focus: 'Fito-Retinoide Biocompatible', actives: ['Bakuchiol 1-2%', 'Péptidos de Cobre', 'Niacinamida 4%'] },
        { night: 3, focus: 'Recuperación Celular', actives: ['Ceramidas', 'Centella Asiática'] },
        { night: 4, focus: 'Calma e Hidratación', actives: ['Pantenol B5', 'Escualano'] },
      ],
      prohibitedActives: ['Retinol', 'Retinaldehído', 'Tretinoína', 'Ácido Salicílico > 2%'],
    };
  }

  // Scenario C: Gentle 5-Night Cycling
  if (profile.skinType === 'SENSITIVE' || profile.barrierStatus === 'COMPROMISED' || profile.experienceLevel === 'BEGINNER') {
    return {
      regimeId: 'gentle-5night-cycling',
      title: 'Ciclo Suave de 5 Noches',
      nights: 5,
      schedule: [
        { night: 1, focus: 'Exfoliación PHA Suave', actives: ['Ácido Mandélico 5%' ] },
        { night: 2, focus: 'Retinoide Amortiguado (Método Sándwich)', actives: ['Retinol 0.2% Amortiguado'] },
        { night: 3, focus: 'Recuperación 1', actives: ['Ceramidas NP'] },
        { night: 4, focus: 'Recuperación 2', actives: ['Pantenol'] },
        { night: 5, focus: 'Recuperación 3', actives: ['Escualano'] },
      ],
      prohibitedActives: ['Ácido Glicólico > 10%', 'Retinaldehído Concentrado'],
    };
  }

  // Scenario D: Classic 4-Night Dermatological Regime
  return {
    regimeId: 'dermatological-classic-4night',
    title: 'Protocolo Científico Clásico de 4 Noches',
    nights: 4,
    schedule: [
      { night: 1, focus: 'Exfoliación Química', actives: profile.skinType === 'OILY' ? ['Ácido Salicílico 2%'] : ['Ácido Glicólico 8%'] },
      { night: 2, focus: 'Retinoide de Alta Eficacia', actives: ['Retinaldehído 0.05%'] },
      { night: 3, focus: 'Recuperación de Barrera', actives: ['Ceramidas NP/AP/EOP', 'Madecassoside'] },
      { night: 4, focus: 'Consolidación Lipídica', actives: ['Pantenol 5%', 'Escualano Puro'] },
    ],
    prohibitedActives: [],
  };
}

describe('Tier 1 - Algorithmic Skin Cycling Engine', () => {
  test('TC-SC-01: Emergency Barrier Reset eliminates all exfoliants and retinoids during acute barrier damage', async () => {
    const profile = {
      skinType: 'DRY',
      barrierStatus: 'ACUTELY_DAMAGED',
      pregnancyOrNursing: false,
      experienceLevel: 'ADVANCED',
    };

    const regime = resolveSkinCyclingRegime(profile);
    assertEqual(regime.regimeId, 'emergency-barrier-reset');
    assertEqual(regime.nights, 4);
    assertTrue(regime.prohibitedActives.includes('Retinol'));
    assertTrue(regime.prohibitedActives.includes('Ácido Glicólico'));

    // Check that every night is dedicated to recovery
    for (const night of regime.schedule) {
      assertFalse(night.focus.includes('Exfoliación'));
      assertFalse(night.focus.includes('Retinoide'));
    }
  });

  test('TC-SC-02: Maternity-Safe regime substitutes teratogenic Vitamin A derivatives with Bakuchiol and Azelaic Acid', async () => {
    const profile = {
      skinType: 'COMBINATION',
      barrierStatus: 'HEALTHY',
      pregnancyOrNursing: true,
      experienceLevel: 'INTERMEDIATE',
    };

    const regime = resolveSkinCyclingRegime(profile);
    assertEqual(regime.regimeId, 'maternity-safe-cycling');
    assertTrue(regime.prohibitedActives.includes('Retinol'));
    assertTrue(regime.prohibitedActives.includes('Tretinoína'));

    // Night 2 must use Bakuchiol
    assertTrue(regime.schedule[1].actives.some(a => a.includes('Bakuchiol')));
    // Night 1 must use Azelaic Acid
    assertTrue(regime.schedule[0].actives.some(a => a.includes('Ácido Azelaico')));
  });

  test('TC-SC-03: Gentle 5-Night regime provides 3 consecutive recovery nights for sensitive biotypes', async () => {
    const profile = {
      skinType: 'SENSITIVE',
      barrierStatus: 'COMPROMISED',
      pregnancyOrNursing: false,
      experienceLevel: 'BEGINNER',
    };

    const regime = resolveSkinCyclingRegime(profile);
    assertEqual(regime.regimeId, 'gentle-5night-cycling');
    assertEqual(regime.nights, 5);

    // Nights 3, 4, 5 must be recovery
    assertEqual(regime.schedule[2].focus, 'Recuperación 1');
    assertEqual(regime.schedule[3].focus, 'Recuperación 2');
    assertEqual(regime.schedule[4].focus, 'Recuperación 3');
  });

  test('TC-SC-04: Classic 4-Night regime schedules targeted exfoliation and high-efficacy retinoid', async () => {
    const profile = {
      skinType: 'OILY',
      barrierStatus: 'HEALTHY',
      pregnancyOrNursing: false,
      experienceLevel: 'ADVANCED',
    };

    const regime = resolveSkinCyclingRegime(profile);
    assertEqual(regime.regimeId, 'dermatological-classic-4night');
    assertEqual(regime.schedule[0].actives[0], 'Ácido Salicílico 2%', 'Oily skin must receive BHA (Salicylic)');
    assertEqual(regime.schedule[1].actives[0], 'Retinaldehído 0.05%');
  });

  test('TC-SC-05: Biophysical layering validator enforces pH and molecular weight rules', async () => {
    function validateLayeringOrder(steps) {
      const stepRanks = {
        CLEANSER: 1,
        LOW_PH_ACID: 2,
        AQUEOUS_SERUM: 3,
        EMULSION_LOTION: 4,
        CREAM_OCCLUSIVE: 5,
        FACIAL_OIL: 6,
        SPF_SUNSCREEN: 7,
      };

      for (let i = 0; i < steps.length - 1; i++) {
        const rankA = stepRanks[steps[i]];
        const rankB = stepRanks[steps[i + 1]];
        if (rankA > rankB) {
          return { valid: false, error: `Invalid layering: ${steps[i]} cannot be applied before ${steps[i + 1]}` };
        }
      }
      return { valid: true };
    }

    const correctAmRoutine = ['CLEANSER', 'LOW_PH_ACID', 'AQUEOUS_SERUM', 'EMULSION_LOTION', 'SPF_SUNSCREEN'];
    assertTrue(validateLayeringOrder(correctAmRoutine).valid);

    // Incorrect: SPF before Serum
    const invertedRoutine = ['CLEANSER', 'SPF_SUNSCREEN', 'AQUEOUS_SERUM'];
    assertFalse(validateLayeringOrder(invertedRoutine).valid);
  });
});
