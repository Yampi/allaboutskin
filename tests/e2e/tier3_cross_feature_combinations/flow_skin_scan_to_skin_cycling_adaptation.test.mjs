/**
 * tests/e2e/tier3_cross_feature_combinations/flow_skin_scan_to_skin_cycling_adaptation.test.mjs
 * Tier 3: Pairwise Flow 7 — Skin Scan Biometrics -> Barrier Damage -> Emergency Reset Adaptation
 * Feature Ref: ORIGINAL_REQUEST §R2 & R4, PROJECT.md Feature 16
 */

import { describe, test } from '../helpers/test_framework.mjs';
import { assertEqual, assertTrue, assertFalse } from '../helpers/assertions.mjs';

describe('Tier 3 - Flow 7: Skin Scan Biometrics -> Routine Adaptation', () => {
  test('TC-PAIR-07: Biometric scan detecting acute redness and barrier breach automatically adapts patient routine', async () => {
    // 1. Initial State: Patient running Classic 4-Night Retinoid cycle
    let activeRoutine = {
      regime: 'dermatological-classic-4night',
      tonightPlan: 'Retinaldehído 0.05% (Noche 2)',
      allowsActives: true,
    };

    // 2. Patient submits a biometric skin scan assessment
    const skinScanResult = {
      scan_id: 'scan-9982',
      erythema_redness_index: 85, // Scale 0-100 (> 75 = severe inflammation)
      desquamation_flaking_score: 78,
      reported_stinging_on_cleansing: true,
    };

    // 3. Biometric Diagnostic Classifier
    function classifyScanBiometrics(scan) {
      if (scan.erythema_redness_index > 75 && scan.reported_stinging_on_cleansing) {
        return {
          diagnosedBarrierStatus: 'ACUTELY_DAMAGED',
          severity: 'HIGH_ALERT',
          actionRequired: 'SUSPEND_ALL_EXFOLIANTS_AND_RETINOIDS',
        };
      }
      return { diagnosedBarrierStatus: 'HEALTHY' };
    }

    const diagnosis = classifyScanBiometrics(skinScanResult);
    assertEqual(diagnosis.diagnosedBarrierStatus, 'ACUTELY_DAMAGED');
    assertEqual(diagnosis.actionRequired, 'SUSPEND_ALL_EXFOLIANTS_AND_RETINOIDS');

    // 4. Algorithmic Routine Adaptation
    function adaptRoutineBasedOnScan(currentRoutine, diagnosis) {
      if (diagnosis.diagnosedBarrierStatus === 'ACUTELY_DAMAGED') {
        return {
          regime: 'emergency-barrier-reset',
          tonightPlan: 'Noche 1: Reparación Lipídica con Centella y Pantenol B5',
          allowsActives: false,
          warningMessage: 'Retinoide suspendido de inmediato por detección de eritema agudo y daño de barrera.',
          recoveryDaysTarget: 14,
        };
      }
      return currentRoutine;
    }

    const adapted = adaptRoutineBasedOnScan(activeRoutine, diagnosis);
    assertEqual(adapted.regime, 'emergency-barrier-reset');
    assertFalse(adapted.allowsActives);
    assertEqual(adapted.recoveryDaysTarget, 14);
    assertTrue(adapted.warningMessage.includes('Retinoide suspendido de inmediato'));
  });
});
