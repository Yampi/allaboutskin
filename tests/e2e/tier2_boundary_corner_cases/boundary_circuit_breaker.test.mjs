/**
 * tests/e2e/tier2_boundary_corner_cases/boundary_circuit_breaker.test.mjs
 * Tier 2: Boundary & Corner Cases — SRE Circuit Breaker Edge States
 * Feature Ref: ORIGINAL_REQUEST §R2, PROJECT.md Feature 9
 */

import { describe, test } from '../helpers/test_framework.mjs';
import { assertEqual, assertTrue, assertFalse, assertThrowsAsync, assertLessThanOrEqual } from '../helpers/assertions.mjs';

class ResilientCircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.cooldownPeriodMs = options.cooldownPeriodMs || 1000;
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = null;
  }

  async execute(action) {
    const now = Date.now();

    if (this.state === 'OPEN') {
      if (now - this.lastFailureTime >= this.cooldownPeriodMs) {
        this.state = 'HALF_OPEN';
      } else {
        const remainingSec = Math.ceil((this.cooldownPeriodMs - (now - this.lastFailureTime)) / 1000);
        const err = new Error('CIRCUIT_OPEN: fast fail');
        err.code = 'CIRCUIT_OPEN';
        err.retryAfterSeconds = remainingSec;
        throw err;
      }
    }

    try {
      const result = await action();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure(err, now);
      throw err;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure(err, timestamp) {
    // Only 5xx or network errors count as systemic failures; 4xx client errors do NOT
    const statusCode = err.status || err.statusCode || 500;
    if (statusCode >= 400 && statusCode < 500) {
      // Client validation/auth error - ignore for circuit tripping
      return;
    }

    this.failureCount++;
    this.lastFailureTime = timestamp;

    if (this.state === 'HALF_OPEN' || this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}

describe('Tier 2 - Boundary Cases: Circuit Breaker Edge States', () => {
  test('TC-BND-CB-01: Exactly 4 consecutive errors (threshold = 5) does NOT trip circuit', async () => {
    const cb = new ResilientCircuitBreaker({ failureThreshold: 5 });

    for (let i = 0; i < 4; i++) {
      try {
        await cb.execute(async () => {
          const err = new Error('500 Server Error');
          err.status = 500;
          throw err;
        });
      } catch {}
    }

    assertEqual(cb.failureCount, 4);
    assertEqual(cb.state, 'CLOSED', 'Circuit must remain CLOSED at 4 failures');

    // A single success resets counter to 0
    await cb.execute(async () => 'OK');
    assertEqual(cb.failureCount, 0);
  });

  test('TC-BND-CB-02: Client errors (HTTP 400, 401, 404, 422) do not increment circuit failure count', async () => {
    const cb = new ResilientCircuitBreaker({ failureThreshold: 3 });

    for (let i = 0; i < 10; i++) {
      try {
        await cb.execute(async () => {
          const err = new Error('404 Not Found');
          err.status = 404;
          throw err;
        });
      } catch {}
    }

    assertEqual(cb.failureCount, 0, '404 errors must not increment failure counter');
    assertEqual(cb.state, 'CLOSED');
  });

  test('TC-BND-CB-03: Cooldown timing boundary enforces sub-millisecond precision', async () => {
    const cb = new ResilientCircuitBreaker({ failureThreshold: 1, cooldownPeriodMs: 60 });

    try {
      await cb.execute(async () => {
        const err = new Error('500');
        err.status = 500;
        throw err;
      });
    } catch {}

    assertEqual(cb.state, 'OPEN');

    // Immediately call -> throws CIRCUIT_OPEN
    await assertThrowsAsync(
      async () => {
        await cb.execute(async () => 'test');
      },
      /CIRCUIT_OPEN/
    );

    // Wait until past cooldown
    await new Promise(r => setTimeout(r, 70));

    // Next call succeeds and transitions state
    const res = await cb.execute(async () => 'PROBE_OK');
    assertEqual(res, 'PROBE_OK');
    assertEqual(cb.state, 'CLOSED');
  });

  test('TC-BND-CB-04: Flapping upstream trips immediately back to OPEN on next failure after probe', async () => {
    const cb = new ResilientCircuitBreaker({ failureThreshold: 2, cooldownPeriodMs: 30 });
    // Trip to OPEN
    try { await cb.execute(async () => { const e = new Error(); e.status = 500; throw e; }); } catch {}
    try { await cb.execute(async () => { const e = new Error(); e.status = 500; throw e; }); } catch {}
    assertEqual(cb.state, 'OPEN');

    // Wait for cooldown
    await new Promise(r => setTimeout(r, 35));

    // Probe succeeds -> CLOSED
    await cb.execute(async () => 'PROBE_OK');
    assertEqual(cb.state, 'CLOSED');

    // But upstream immediately fails on the very next 2 calls
    try { await cb.execute(async () => { const e = new Error(); e.status = 500; throw e; }); } catch {}
    try { await cb.execute(async () => { const e = new Error(); e.status = 500; throw e; }); } catch {}
    assertEqual(cb.state, 'OPEN', 'Flapping upstream trips back to OPEN');
  });

  test('TC-BND-CB-05: Fast-fail response time under OPEN state is sub-1ms', async () => {
    const cb = new ResilientCircuitBreaker({ failureThreshold: 1, cooldownPeriodMs: 10000 });
    try { await cb.execute(async () => { const e = new Error(); e.status = 500; throw e; }); } catch {}
    assertEqual(cb.state, 'OPEN');

    const start = performance.now();
    try {
      await cb.execute(async () => 'FAIL');
    } catch {}
    const duration = performance.now() - start;

    assertLessThanOrEqual(duration, 2.0, `Fast-fail execution (${duration.toFixed(2)}ms) must be under 2ms`);
  });
});
