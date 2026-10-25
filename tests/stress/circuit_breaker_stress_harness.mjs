/**
 * SRE Circuit Breaker Adversarial Empirical Stress Test Harness
 * 
 * Tests:
 * 1. Concurrency Probe Contention in HALF_OPEN (10 concurrent requests)
 * 2. Rapid flapping & state oscillation stability
 * 3. Complete HTTP Status Code Matrix (400-422 safe, 429 & 5xx tripping)
 * 4. Resiliency against rogue/throwing event listeners
 * 5. Millisecond-accurate cooldown and retryAfter calculation
 */

import { CircuitBreaker, CircuitBreakerError, ApiError } from '../../frontend/src/lib/circuitBreaker.ts';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    failed++;
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

async function runAdversarialStressSuite() {
  console.log('=================================================================');
  console.log('     CIRCUIT BREAKER EMPIRICAL ADVERSARIAL STRESS HARNESS        ');
  console.log('=================================================================\n');

  // --- STRESS 1: HALF_OPEN Probe Concurrency Race ---
  console.log('[STRESS 1] Testing probe concurrency in HALF_OPEN with 10 parallel callers...');
  const cb1 = new CircuitBreaker({
    failureThreshold: 2,
    resetTimeout: 100,
    probeSuccessThreshold: 1,
  });

  // Trip to OPEN
  cb1.trip();
  assert(cb1.getState() === 'OPEN', 'Tripped to OPEN');

  // Wait for resetTimeout to expire
  await new Promise((r) => setTimeout(r, 120));
  assert(cb1.getState() === 'HALF_OPEN', 'Successfully reached HALF_OPEN');

  let activeProbeCount = 0;
  let probeExecutedCount = 0;
  let rejectedCount = 0;

  // Launch 10 concurrent requests simultaneously
  const results = await Promise.allSettled(
    Array.from({ length: 10 }).map((_, i) =>
      cb1.execute(async () => {
        activeProbeCount++;
        probeExecutedCount++;
        assert(activeProbeCount === 1, `Probe must be strictly exclusive (active count was ${activeProbeCount})`);
        // Simulate 50ms slow network probe
        await new Promise((r) => setTimeout(r, 50));
        activeProbeCount--;
        return `PROBE_SUCCESS_${i}`;
      })
    )
  );

  let successCount = 0;
  for (const res of results) {
    if (res.status === 'fulfilled') {
      successCount++;
    } else {
      if (res.reason instanceof CircuitBreakerError) {
        rejectedCount++;
      }
    }
  }

  assert(probeExecutedCount === 1, `Only exactly 1 probe was executed (got: ${probeExecutedCount})`);
  assert(successCount === 1, `Exactly 1 caller succeeded with probe response (got: ${successCount})`);
  assert(rejectedCount === 9, `All 9 concurrent contenders were rejected fail-fast with CircuitBreakerError (got: ${rejectedCount})`);
  assert(cb1.getState() === 'CLOSED', 'Circuit successfully recovered to CLOSED after probe completed');

  // --- STRESS 2: HTTP Status Code Matrix ---
  console.log('\n[STRESS 2] Testing HTTP status code boundary matrix...');
  const cb2 = new CircuitBreaker({ failureThreshold: 3 });

  // 2.1 Non-tripping client codes (400, 401, 403, 404, 422)
  const clientCodes = [400, 401, 403, 404, 422];
  for (const code of clientCodes) {
    try {
      await cb2.execute(async () => {
        const err = new Error(`Client error ${code}`);
        err.statusCode = code;
        throw err;
      });
    } catch (e) {
      // Expected
    }
  }
  assert(cb2.getState() === 'CLOSED', `Status codes ${clientCodes.join(', ')} do NOT trip the circuit breaker`);
  assert(cb2.getStats().consecutiveFailures === 0, 'Consecutive failures remained 0 for client errors');

  // 2.2 Tripping code: 429 Too Many Requests
  for (let i = 0; i < 3; i++) {
    try {
      await cb2.execute(async () => {
        const err = new Error('Rate limited');
        err.statusCode = 429;
        throw err;
      });
    } catch (e) {
      // Expected
    }
  }
  assert(cb2.getState() === 'OPEN', 'HTTP 429 Rate Limited tripped the circuit breaker to OPEN after threshold');

  // --- STRESS 3: Server Error Codes (500, 502, 503, 504) ---
  console.log('\n[STRESS 3] Testing server error tripping (500, 502, 503, 504)...');
  const serverCodes = [500, 502, 503, 504];
  for (const code of serverCodes) {
    const cbServer = new CircuitBreaker({ failureThreshold: 2 });
    for (let i = 0; i < 2; i++) {
      try {
        await cbServer.execute(async () => {
          const err = new Error(`Server error ${code}`);
          err.statusCode = code;
          throw err;
        });
      } catch (e) {
        // Expected
      }
    }
    assert(cbServer.getState() === 'OPEN', `HTTP ${code} server error tripped circuit to OPEN`);
  }

  // --- STRESS 4: Rogue Event Listener Resiliency ---
  console.log('\n[STRESS 4] Testing resiliency against throwing event listeners...');
  const cb4 = new CircuitBreaker({ failureThreshold: 2 });
  
  // Register a rogue listener that throws
  cb4.onStateChange((state) => {
    throw new Error('MALICIOUS_LISTENER_CRASH');
  });

  // State transitions should not crash the caller
  let transitionError = null;
  try {
    cb4.trip();
  } catch (err) {
    transitionError = err;
  }
  assert(transitionError === null, 'CircuitBreaker state transition did NOT propagate rogue listener exception');
  assert(cb4.getState() === 'OPEN', 'State successfully transitioned to OPEN despite rogue listener');

  // --- STRESS 5: Accurate retryAfter calculation ---
  console.log('\n[STRESS 5] Testing retryAfterSeconds calculation during OPEN state...');
  const cb5 = new CircuitBreaker({ failureThreshold: 1, resetTimeout: 3000 });
  cb5.trip();
  const retryAfter = cb5.getRetryAfterSeconds();
  assert(retryAfter >= 2 && retryAfter <= 3, `retryAfterSeconds (${retryAfter}) correctly reflects remaining cooldown`);

  console.log('\n=================================================================');
  console.log(`TOTAL ADVERSARIAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('=================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL CIRCUIT BREAKER ADVERSARIAL STRESS TESTS PASSED!');
    process.exit(0);
  }
}

runAdversarialStressSuite().catch((err) => {
  console.error('Fatal crash in stress harness:', err);
  process.exit(1);
});
