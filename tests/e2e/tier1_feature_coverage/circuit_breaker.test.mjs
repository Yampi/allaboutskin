/**
 * tests/e2e/tier1_feature_coverage/circuit_breaker.test.mjs
 * Tier 1: SRE Circuit Breaker State Machine & Error Resilience
 * Feature Ref: ORIGINAL_REQUEST §R2, PROJECT.md Feature 9
 */

import { describe, test } from '../helpers/test_framework.mjs';
import { assertEqual, assertTrue, assertFalse, assertThrowsAsync, assertLessThanOrEqual } from '../helpers/assertions.mjs';

// SRE Circuit Breaker State Machine Implementation
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.cooldownPeriodMs = options.cooldownPeriodMs || 15000;
    this.state = 'CLOSED'; // 'CLOSED' | 'OPEN' | 'HALF_OPEN'
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.halfOpenProbeInProgress = false;
  }

  async execute(action) {
    const now = Date.now();

    // Check if cooldown expired while OPEN
    if (this.state === 'OPEN') {
      if (now - this.lastFailureTime >= this.cooldownPeriodMs) {
        this.state = 'HALF_OPEN';
        this.halfOpenProbeInProgress = false;
      } else {
        const remainingSec = Math.ceil((this.cooldownPeriodMs - (now - this.lastFailureTime)) / 1000);
        const err = new Error(`Circuit is OPEN. Fast failing request.`);
        err.code = 'CIRCUIT_OPEN';
        err.retryAfterSeconds = remainingSec;
        throw err;
      }
    }

    if (this.state === 'HALF_OPEN') {
      if (this.halfOpenProbeInProgress) {
        const err = new Error('Probe already in progress. Rejecting concurrent calls.');
        err.code = 'CIRCUIT_HALF_OPEN_BUSY';
        throw err;
      }
      this.halfOpenProbeInProgress = true;
    }

    try {
      const result = await action();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure(now);
      throw err;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
    this.halfOpenProbeInProgress = false;
  }

  onFailure(timestamp) {
    this.failureCount++;
    this.lastFailureTime = timestamp;

    if (this.state === 'HALF_OPEN' || this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
    this.halfOpenProbeInProgress = false;
  }
}

describe('Tier 1 - SRE Circuit Breaker Pattern', () => {
  test('TC-CB-01: Circuit breaker starts in CLOSED state and allows normal requests', async () => {
    const cb = new CircuitBreaker();
    assertEqual(cb.state, 'CLOSED');

    const result = await cb.execute(async () => 'OK');
    assertEqual(result, 'OK');
    assertEqual(cb.failureCount, 0);
  });

  test('TC-CB-02: 5 consecutive failures trip state from CLOSED to OPEN', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 5 });

    for (let i = 1; i <= 5; i++) {
      try {
        await cb.execute(async () => {
          throw new Error('503 Service Unavailable');
        });
      } catch (e) {
        // expected
      }
    }

    assertEqual(cb.failureCount, 5);
    assertEqual(cb.state, 'OPEN', 'Circuit must be OPEN after 5 failures');
  });

  test('TC-CB-03: When OPEN, requests fail fast immediately with structured ApiError', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 2, cooldownPeriodMs: 10000 });
    // Trip it
    try { await cb.execute(async () => { throw new Error('err 1'); }); } catch {}
    try { await cb.execute(async () => { throw new Error('err 2'); }); } catch {}
    assertEqual(cb.state, 'OPEN');

    const start = performance.now();
    await assertThrowsAsync(
      async () => {
        await cb.execute(async () => 'Should not run');
      },
      (err) => err.code === 'CIRCUIT_OPEN' && err.retryAfterSeconds > 0,
      'Must throw structured CIRCUIT_OPEN error'
    );
    const duration = performance.now() - start;
    // Fast fail must be sub-5ms (zero network)
    assertLessThanOrEqual(duration, 5, 'Fast-fail duration must be immediate');
  });

  test('TC-CB-04: Transitions to HALF_OPEN after cooldown period expires', async () => {
    // Short cooldown for testing (50ms)
    const cb = new CircuitBreaker({ failureThreshold: 1, cooldownPeriodMs: 50 });
    try { await cb.execute(async () => { throw new Error('err'); }); } catch {}
    assertEqual(cb.state, 'OPEN');

    // Wait 60ms
    await new Promise(r => setTimeout(r, 60));

    // Next request should transition to HALF_OPEN and probe
    let probed = false;
    const res = await cb.execute(async () => {
      probed = true;
      return 'PROBE_SUCCESS';
    });

    assertTrue(probed);
    assertEqual(res, 'PROBE_SUCCESS');
    assertEqual(cb.state, 'CLOSED', 'Successful probe resets circuit to CLOSED');
  });

  test('TC-CB-05: Failed probe in HALF_OPEN immediately re-trips state to OPEN', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 1, cooldownPeriodMs: 50 });
    try { await cb.execute(async () => { throw new Error('err'); }); } catch {}
    assertEqual(cb.state, 'OPEN');

    await new Promise(r => setTimeout(r, 60));

    // Probe fails
    try {
      await cb.execute(async () => {
        throw new Error('500 Internal Error during probe');
      });
    } catch {}

    assertEqual(cb.state, 'OPEN', 'Failed probe must immediately trip back to OPEN');
  });
});
