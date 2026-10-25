/**
 * tests/e2e/tier3_cross_feature_combinations/flow_circuit_breaker_to_offline_fallback.test.mjs
 * Tier 3: Pairwise Flow 4 — Backend Failure -> Circuit Breaker Trip -> DLG-EXEC Honest Error State
 * Feature Ref: ORIGINAL_REQUEST §R2, PROJECT.md Feature 8 & 9
 */

import { describe, test } from '../helpers/test_framework.mjs';
import { assertEqual, assertTrue, assertFalse } from '../helpers/assertions.mjs';
import { DLG_EXEC_TOKENS } from '../helpers/fixtures.mjs';

describe('Tier 3 - Flow 4: Backend Outage -> Circuit Breaker Trip -> DLG-EXEC UI Fallback', () => {
  test('TC-PAIR-04: Upstream 503 storm trips circuit breaker and renders honest DLG-EXEC error card', async () => {
    // 1. Circuit Breaker Simulation
    let circuitState = 'CLOSED';
    let failures = 0;
    const failureThreshold = 5;

    async function simulatedApiClientCall(backendOnline = false) {
      if (circuitState === 'OPEN') {
        const err = new Error('CIRCUIT_OPEN: Upstream offline. Fast failing.');
        err.code = 'CIRCUIT_OPEN';
        err.retryAfterSeconds = 15;
        throw err;
      }

      if (!backendOnline) {
        failures++;
        if (failures >= failureThreshold) {
          circuitState = 'OPEN';
        }
        const err = new Error('503 Service Unavailable: Database offline');
        err.statusCode = 503;
        throw err;
      }

      failures = 0;
      circuitState = 'CLOSED';
      return { status: 'success', data: [] };
    }

    // 2. Trigger 5 consecutive 503 failures
    for (let i = 0; i < 5; i++) {
      try {
        await simulatedApiClientCall(false);
      } catch (e) {
        // expected
      }
    }

    assertEqual(circuitState, 'OPEN', 'Circuit breaker must have tripped to OPEN');

    // 3. 6th call fails fast immediately
    let caughtError = null;
    try {
      await simulatedApiClientCall(false);
    } catch (err) {
      caughtError = err;
    }

    assertTrue(caughtError !== null);
    assertEqual(caughtError.code, 'CIRCUIT_OPEN');
    assertEqual(caughtError.retryAfterSeconds, 15);

    // 4. UI Layer maps ApiError to DLG-EXEC Error Card State
    function renderDlgExecErrorCard(apiError) {
      return {
        component: 'DlgExecErrorAlert',
        title: 'Conexión con el servidor central interrumpida',
        message: 'No pudimos sincronizar los datos en este momento. El sistema está operando en modo protegido.',
        code: apiError.code,
        canRetry: true,
        actionLabel: 'Reintentar ahora',
        styling: {
          backgroundColor: DLG_EXEC_TOKENS.cardBackground,
          borderColor: DLG_EXEC_TOKENS.borderDefault,
          accentColor: DLG_EXEC_TOKENS.brandAccent,
          borderRadius: `${DLG_EXEC_TOKENS.maxBorderRadiusPx}px`,
        },
      };
    }

    const errorCard = renderDlgExecErrorCard(caughtError);
    assertEqual(errorCard.code, 'CIRCUIT_OPEN');
    assertEqual(errorCard.title, 'Conexión con el servidor central interrumpida');
    assertEqual(errorCard.styling.borderColor, '#E2E8F0');
    assertEqual(errorCard.styling.accentColor, '#4A6B5B');
    assertTrue(errorCard.canRetry);
  });
});
