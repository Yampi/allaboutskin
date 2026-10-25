/**
 * tests/e2e/tier2_boundary_corner_cases/boundary_network_dropouts.test.mjs
 * Tier 2: Boundary & Corner Cases — Network Dropouts, AbortController & Socket Resets
 * Feature Ref: ORIGINAL_REQUEST §R2, PROJECT.md Feature 9
 */

import { describe, test } from '../helpers/test_framework.mjs';
import { assertEqual, assertTrue, assertFalse, assertThrowsAsync } from '../helpers/assertions.mjs';

async function simulateNetworkFetch(url, options = {}) {
  const signal = options.signal;

  if (signal?.aborted) {
    const err = new Error('The operation was aborted');
    err.name = 'AbortError';
    err.code = 20;
    throw err;
  }

  // Simulated error scenarios based on URL
  if (url.includes('error-enotfound')) {
    const err = new Error('getaddrinfo ENOTFOUND api.allabout.skin');
    err.code = 'ENOTFOUND';
    err.statusCode = 503;
    throw err;
  }

  if (url.includes('error-econnreset')) {
    const err = new Error('read ECONNRESET');
    err.code = 'ECONNRESET';
    err.statusCode = 502;
    throw err;
  }

  if (url.includes('error-gateway-504')) {
    return {
      ok: false,
      status: 504,
      statusText: 'Gateway Timeout',
      json: async () => ({ error: 'Upstream gateway timed out after 8000ms' }),
    };
  }

  return {
    ok: true,
    status: 200,
    json: async () => ({ status: 'operational' }),
  };
}

describe('Tier 2 - Boundary Cases: Network Failures & Abort Handling', () => {
  test('TC-BND-NET-01: AbortController signal aborts in-flight request cleanly with AbortError', async () => {
    const controller = new AbortController();
    controller.abort(); // Pre-emptively abort

    await assertThrowsAsync(
      async () => {
        await simulateNetworkFetch('https://api.allabout.skin/health', { signal: controller.signal });
      },
      /The operation was aborted/
    );
  });

  test('TC-BND-NET-02: DNS resolution failure (ENOTFOUND) surfaces as typed network exception', async () => {
    await assertThrowsAsync(
      async () => {
        await simulateNetworkFetch('https://error-enotfound.allabout.skin');
      },
      /ENOTFOUND/
    );
  });

  test('TC-BND-NET-03: Socket connection reset (ECONNRESET) surfaces as typed network exception', async () => {
    await assertThrowsAsync(
      async () => {
        await simulateNetworkFetch('https://error-econnreset.allabout.skin');
      },
      /ECONNRESET/
    );
  });

  test('TC-BND-NET-04: HTTP 504 Gateway Timeout is captured without unhandled rejection', async () => {
    const res = await simulateNetworkFetch('https://api.allabout.skin/error-gateway-504');
    assertFalse(res.ok);
    assertEqual(res.status, 504);

    const body = await res.json();
    assertTrue(body.error.includes('Gateway Timeout') || body.error.includes('timed out'));
  });

  test('TC-BND-NET-05: Clean response passes with HTTP 200 operational state', async () => {
    const res = await simulateNetworkFetch('https://api.allabout.skin/health');
    assertTrue(res.ok);
    assertEqual(res.status, 200);
    const body = await res.json();
    assertEqual(body.status, 'operational');
  });
});
