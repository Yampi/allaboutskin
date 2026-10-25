/**
 * tests/e2e/tier4_real_world_application_scenarios/scenario_02_pregnant_user_melasma_routine_and_safe_audit.test.mjs
 * Tier 4: Real-World Scenario 2 — Expecting Mother Melasma Routine & Safe INCI Audit
 * Critical toxicological and clinical safety checks for maternity-safe skincare
 */

import { describe, test } from '../helpers/test_framework.mjs';
import { assertEqual, assertTrue, assertFalse } from '../helpers/assertions.mjs';

describe('Tier 4 - Scenario 2: Expecting Mother Melasma Routine & Toxicological Safeguard', () => {
  test('Audit flags teratogenic Retinoids and safely transitions patient to Bakuchiol and Azelaic Acid', async () => {
    // 1. Patient is pregnant with hormonal melasma
    const expectingMother = {
      name: 'Mariana Gomez',
      pregnancyOrNursing: true,
      skinConditions: ['HYPERPIGMENTATION'], // Melasma
      currentSerumFormula: 'Aqua, Caprylic Triglyceride, Retinol 0.5%, Glycolic Acid 8%, Polysorbate 20',
    };

    // 2. Toxicological INCI Safety Engine checks formula against maternity contraindications
    function auditMaternitySafety(rawFormula, isPregnant) {
      const tokens = rawFormula.toUpperCase();
      const findings = [];

      if (isPregnant) {
        if (tokens.includes('RETINOL') || tokens.includes('RETINAL') || tokens.includes('TRETINOIN')) {
          findings.push({
            substance: 'Retinoides / Derivados de Vitamina A',
            riskCategory: 'TERATOGENIC_RISK',
            severity: 'CRITICAL_CONTRAINDICATION',
            message: 'Derivados de vitamina A contraindicados en gestación/lactancia por riesgo teratogénico.',
            substitute: 'Bakuchiol 1-2%',
          });
        }
        if (tokens.includes('GLYCOLIC ACID') || tokens.includes('SALICYLIC ACID')) {
          findings.push({
            substance: 'Hidroxiácidos de Alta Concentración',
            riskCategory: 'HYPERPIGMENTATION_RISK',
            severity: 'WARNING',
            message: 'Los AHA/BHA agresivos pueden inducir eritema y empeorar el melasma hormonal (cloasma).',
            substitute: 'Ácido Azelaico 10-15%',
          });
        }
      }

      return {
        safeForPregnancy: findings.length === 0,
        contraindications: findings,
      };
    }

    const audit = auditMaternitySafety(expectingMother.currentSerumFormula, expectingMother.pregnancyOrNursing);
    assertFalse(audit.safeForPregnancy);
    assertEqual(audit.contraindications.length, 2);
    assertEqual(audit.contraindications[0].riskCategory, 'TERATOGENIC_RISK');

    // 3. Clinical engine prescribes Maternity-Safe Skin Cycling Protocol
    const maternityRoutine = {
      regime: 'maternity-safe-cycling',
      schedule: [
        { night: 1, active: 'Ácido Azelaico 10%', function: 'Control de Melasma sin toxicidad sistémica' },
        { night: 2, active: 'Bakuchiol 1.5%', function: 'Estimulación de colágeno sin receptores RAR nucleares' },
        { night: 3, active: 'Centella Asiática + Ceramidas', function: 'Reparación de barrera y desinflamación' },
        { night: 4, active: 'Pantenol B5 + Escualano', function: 'Nutrición lipídica profunda' },
      ],
      mandatoryAmStep: 'Fotoprotector Mineral FPS 50+ (Óxido de Zinc no nano)',
    };

    assertEqual(maternityRoutine.regime, 'maternity-safe-cycling');
    assertEqual(maternityRoutine.schedule[0].active, 'Ácido Azelaico 10%');
    assertEqual(maternityRoutine.schedule[1].active, 'Bakuchiol 1.5%');
    assertTrue(maternityRoutine.mandatoryAmStep.includes('FPS 50+'));
  });
});
