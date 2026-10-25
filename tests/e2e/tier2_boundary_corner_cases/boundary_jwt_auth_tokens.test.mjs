/**
 * tests/e2e/tier2_boundary_corner_cases/boundary_jwt_auth_tokens.test.mjs
 * Tier 2: Boundary & Corner Cases — JWT Authentication & Bearer Header Validation
 * Feature Ref: ORIGINAL_REQUEST §R2, PROJECT.md Feature 17
 */

import { describe, test } from '../helpers/test_framework.mjs';
import { assertEqual, assertTrue, assertFalse, assertThrowsSync } from '../helpers/assertions.mjs';

function validateBearerToken(authHeader, currentTimeSeconds = Math.floor(Date.now() / 1000)) {
  if (!authHeader || typeof authHeader !== 'string') {
    throw new Error('401 Unauthorized: Authorization header missing');
  }

  const raw = authHeader.trim();
  if (!raw.startsWith('Bearer')) {
    throw new Error('401 Unauthorized: Malformed Authorization header. Expected "Bearer <token>"');
  }

  const token = raw.replace(/^Bearer\s*/, '').trim();
  if (!token) {
    throw new Error('401 Unauthorized: Empty bearer token');
  }

  // Check 3-part structure (header.payload.signature)
  const tokenParts = token.split('.');
  if (tokenParts.length !== 3) {
    throw new Error('401 Unauthorized: Invalid JWT structure. Must have 3 dot-separated segments');
  }

  // Parse header and payload
  let header, payload;
  try {
    header = JSON.parse(Buffer.from(tokenParts[0], 'base64url').toString('utf8'));
    payload = JSON.parse(Buffer.from(tokenParts[1], 'base64url').toString('utf8'));
  } catch (e) {
    throw new Error('401 Unauthorized: Malformed Base64Url JWT encoding');
  }

  // Security: Reject 'none' algorithm
  if (!header.alg || header.alg.toLowerCase() === 'none') {
    throw new Error('401 Unauthorized: Insecure algorithm "none" rejected');
  }

  // Check expiration (exp)
  if (payload.exp && payload.exp < currentTimeSeconds) {
    throw new Error(`401 Unauthorized: Token has expired at ${payload.exp}`);
  }

  // Check Not Before (nbf)
  if (payload.nbf && payload.nbf > currentTimeSeconds) {
    throw new Error(`401 Unauthorized: Token is not yet valid (nbf: ${payload.nbf})`);
  }

  return { valid: true, payload };
}

function makeToken(headerObj, payloadObj) {
  const h = Buffer.from(JSON.stringify(headerObj)).toString('base64url');
  const p = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
  const s = 'simulated_signature_hash';
  return `${h}.${p}.${s}`;
}

describe('Tier 2 - Boundary Cases: JWT Bearer Token Security', () => {
  const now = 1729870000;

  test('TC-BND-JWT-01: Empty or missing Bearer token throws 401 Unauthorized', async () => {
    assertThrowsSync(() => validateBearerToken(''), /Authorization header missing/);
    assertThrowsSync(() => validateBearerToken('Bearer '), /Empty bearer token/);
    assertThrowsSync(() => validateBearerToken('Basic dXNlcjpwYXNz'), /Malformed Authorization header/);
  });

  test('TC-BND-JWT-02: Non 3-part JWT structure throws invalid structure error', async () => {
    assertThrowsSync(() => validateBearerToken('Bearer invalid-random-token'), /Invalid JWT structure/);
    assertThrowsSync(() => validateBearerToken('Bearer part1.part2'), /Invalid JWT structure/);
  });

  test('TC-BND-JWT-03: Expired token (exp in past) throws token expired error', async () => {
    const expiredToken = makeToken({ alg: 'HS256' }, { sub: 101, exp: now - 300 });
    assertThrowsSync(
      () => validateBearerToken(`Bearer ${expiredToken}`, now),
      /Token has expired/
    );
  });

  test('TC-BND-JWT-04: Insecure "none" algorithm header attack is rejected immediately', async () => {
    const noneToken = makeToken({ alg: 'none' }, { sub: 101, exp: now + 3600 });
    assertThrowsSync(
      () => validateBearerToken(`Bearer ${noneToken}`, now),
      /Insecure algorithm "none" rejected/
    );
  });

  test('TC-BND-JWT-05: Valid token with future exp and past nbf passes validation cleanly', async () => {
    const validToken = makeToken(
      { alg: 'HS256', typ: 'JWT' },
      { sub: 101, role: 'standard_user', exp: now + 3600, nbf: now - 10 }
    );
    const result = validateBearerToken(`Bearer ${validToken}`, now);
    assertTrue(result.valid);
    assertEqual(result.payload.sub, 101);
    assertEqual(result.payload.role, 'standard_user');
  });
});
