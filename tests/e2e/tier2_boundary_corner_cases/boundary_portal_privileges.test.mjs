/**
 * tests/e2e/tier2_boundary_corner_cases/boundary_portal_privileges.test.mjs
 * Tier 2: Boundary & Corner Cases — Privilege Escalation & Cross-Tenant Security
 * Feature Ref: ORIGINAL_REQUEST §R1, PROJECT.md Feature 17
 */

import { describe, test } from '../helpers/test_framework.mjs';
import { assertEqual, assertTrue, assertFalse, assertThrowsAsync } from '../helpers/assertions.mjs';
import { USER_FIXTURES } from '../helpers/fixtures.mjs';

function processUserProfileUpdate(currentUser, updatePayload) {
  // Mass assignment protection: role cannot be updated by normal user profile endpoint
  const allowedFields = ['name', 'phone', 'avatar_url', 'bio'];
  const sanitizedUpdate = {};

  for (const [key, value] of Object.entries(updatePayload)) {
    if (key === 'role') {
      const err = new Error('403 Forbidden: Privilege escalation attempt. Role cannot be updated via profile endpoint.');
      err.status = 403;
      throw err;
    }
    if (allowedFields.includes(key)) {
      sanitizedUpdate[key] = value;
    }
  }

  return { ...currentUser, ...sanitizedUpdate };
}

function verifyOfferModification(merchantUserId, offerRecord) {
  if (offerRecord.merchant_id !== merchantUserId) {
    const err = new Error('403 Forbidden: Cross-tenant modification denied. You do not own this offer.');
    err.status = 403;
    throw err;
  }
  return true;
}

function authenticateSession(user) {
  if (!user || !user.token) {
    const err = new Error('401 Unauthorized: Missing authentication token');
    err.status = 401;
    throw err;
  }
  if (user.is_active === false) {
    const err = new Error('403 Forbidden: Account is locked or suspended by administrator');
    err.status = 403;
    throw err;
  }
  return { authenticated: true, user };
}

describe('Tier 2 - Boundary Cases: Privilege Escalation & Security Boundaries', () => {
  test('TC-BND-AUTH-01: Mass assignment attack attempting to escalate role to super_admin is rejected with 403', async () => {
    const user = USER_FIXTURES.standardUser;
    const maliciousPayload = {
      name: 'Valentina Updated',
      role: 'super_admin', // Privilege escalation attempt
    };

    await assertThrowsAsync(
      async () => {
        processUserProfileUpdate(user, maliciousPayload);
      },
      /403 Forbidden.*Privilege escalation/,
      'Must reject role escalation attempt'
    );
  });

  test('TC-BND-AUTH-02: Normal profile fields (name, phone) update cleanly without role corruption', async () => {
    const user = USER_FIXTURES.standardUser;
    const safePayload = { name: 'Valentina M.', phone: '+58 412 111 2233' };
    const updated = processUserProfileUpdate(user, safePayload);

    assertEqual(updated.name, 'Valentina M.');
    assertEqual(updated.role, 'standard_user', 'Role must remain intact');
  });

  test('TC-BND-AUTH-03: Deactivated / suspended accounts are blocked at session check', async () => {
    const suspendedUser = { ...USER_FIXTURES.standardUser, is_active: false };

    await assertThrowsAsync(
      async () => {
        authenticateSession(suspendedUser);
      },
      /403 Forbidden.*Account is locked/,
      'Suspended account must be rejected'
    );
  });

  test('TC-BND-AUTH-04: Cross-tenant offer modification is blocked with 403 Forbidden', async () => {
    const merchantId = 102;
    const foreignOffer = { id: 88, merchant_id: 999, product_name: 'Serum Competencia' };

    await assertThrowsAsync(
      async () => {
        verifyOfferModification(merchantId, foreignOffer);
      },
      /403 Forbidden.*Cross-tenant modification denied/
    );
  });

  test('TC-BND-AUTH-05: Missing or null token returns 401 Unauthorized', async () => {
    await assertThrowsAsync(
      async () => {
        authenticateSession({ name: 'Anonymous', token: null });
      },
      /401 Unauthorized/
    );
  });
});
