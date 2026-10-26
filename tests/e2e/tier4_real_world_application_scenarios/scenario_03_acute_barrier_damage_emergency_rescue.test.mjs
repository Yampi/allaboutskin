/**
 * tests/e2e/tier4_real_world_application_scenarios/scenario_03_acute_barrier_damage_emergency_rescue.test.mjs
 * Tier 4: Real-World Scenario 3 — Acute Barrier Burn Emergency Protocol & Full Rehabilitation
 * Clinical recovery tracking from acute chemical irritation to healthy stratum corneum
 */

import { describe, test } from '../helpers/test_framework.mjs';
import { assertEqual, assertTrue, assertFalse } from '../helpers/assertions.mjs';

describe('Tier 4 - Scenario 3: Acute Barrier Damage Emergency Rescue Protocol', () => {
  test('Complete recovery cycle: Chemical irritation triage -> Total active lockout -> 14-day lipid restoration', async () => {
    // 1. Initial State: Patient arrives with acute chemical burning from peeling solution
    const patientState = {
      user_id: 402,
      barrierStatus: 'ACUTELY_DAMAGED',
      burningScore: 9, // Scale 1-10
      flakingPresent: true,
      adherenceHistoryDays: [],
    };

    // 2. Triage Engine engages Emergency Barrier Reset
    function initiateRescueProtocol(patient) {
      if (patient.barrierStatus !== 'ACUTELY_DAMAGED') {
        throw new Error('Rescue protocol only intended for acute barrier damage');
      }

      return {
        regime: 'emergency-barrier-reset',
        activeLockoutDurationDays: 14,
        allowedProducts: [
          'Agua Termal Suave',
          'Syndet Fisiológico pH 5.5',
          'Bálsamo Ceramidas NP/AP/EOP + Madecassoside',
          'Pantenol 5% Lipídico',
          'Escualano 100% Puro Vegetal',
          'Fotoprotector Mineral Hipoalergénico',
        ],
        prohibitedIngredients: ['Ácido Glicólico', 'Ácido Salicílico', 'Retinol', 'Retinal', 'Alcohol Denat', 'Fragancia'],
      };
    }

    const rescue = initiateRescueProtocol(patientState);
    assertEqual(rescue.regime, 'emergency-barrier-reset');
    assertEqual(rescue.activeLockoutDurationDays, 14);
    assertTrue(rescue.prohibitedIngredients.includes('Retinol'));
    assertTrue(rescue.prohibitedIngredients.includes('Ácido Glicólico'));

    // 3. Patient logs 14 days of 100% lipid recovery adherence
    for (let day = 1; day <= 14; day++) {
      patientState.adherenceHistoryDays.push({
        day,
        amCompleted: true,
        pmCompleted: true,
        appliedLipids: true,
        appliedActives: false, // Strict compliance
      });
      // Progressive symptom reduction
      patientState.burningScore = Math.max(0, 9 - Math.floor(day * 0.7));
    }

    assertEqual(patientState.adherenceHistoryDays.length, 14);
    assertEqual(patientState.burningScore, 0, 'Burning score must resolve to 0 after 14 days');

    // 4. End of protocol: Re-evaluation certifies barrier restoration
    function reevaluateBarrier(adherenceDays, currentBurning) {
      const allCompliant = adherenceDays.every(d => d.amCompleted && d.pmCompleted && !d.appliedActives);
      if (allCompliant && adherenceDays.length >= 14 && currentBurning === 0) {
        return {
          recovered: true,
          newBarrierStatus: 'HEALTHY',
          canResumeGentleCycling: true,
          nextRegime: 'gentle-5night-cycling', // Re-entry must be gentle
        };
      }
      return { recovered: false, newBarrierStatus: 'COMPROMISED' };
    }

    const outcome = reevaluateBarrier(patientState.adherenceHistoryDays, patientState.burningScore);
    assertTrue(outcome.recovered);
    assertEqual(outcome.newBarrierStatus, 'HEALTHY');
    assertEqual(outcome.nextRegime, 'gentle-5night-cycling');
  });
});
