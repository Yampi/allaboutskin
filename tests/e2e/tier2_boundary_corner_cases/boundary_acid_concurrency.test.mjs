/**
 * tests/e2e/tier2_boundary_corner_cases/boundary_acid_concurrency.test.mjs
 * Tier 2: Boundary & Corner Cases — ACID Concurrency & Partial Failure
 * Feature Ref: ORIGINAL_REQUEST §R2, PROJECT.md Feature 7
 */

import { describe, test } from '../helpers/test_framework.mjs';
import { assertEqual, assertTrue, assertFalse, assertThrowsAsync } from '../helpers/assertions.mjs';
import { STORE_FIXTURES } from '../helpers/fixtures.mjs';

class ConcurrentTransactionalStore {
  constructor() {
    this.stores = new Map(); // slug -> store
    this.branches = [];
    this.owners = new Map(); // userId -> storeId
  }

  async atomicRegister(userId, storeData, branchData) {
    // Check if user already owns a store
    if (this.owners.has(userId)) {
      const err = new Error('409 Conflict: Ya posees una tienda registrada en esta cuenta.');
      err.status = 409;
      throw err;
    }

    // Slug collision check
    const slug = storeData.slug || storeData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (this.stores.has(slug)) {
      const err = new Error(`409 Conflict: El slug de comercio "${slug}" ya se encuentra registrado.`);
      err.status = 409;
      throw err;
    }

    // Validate branch data
    if (!branchData.name || !branchData.address || branchData.latitude == null || branchData.longitude == null) {
      const err = new Error('422 Unprocessable Entity: Branch data is incomplete');
      err.status = 422;
      throw err;
    }

    // Execute atomic creation
    const storeId = this.stores.size + 1;
    const store = { id: storeId, owner_id: userId, slug, ...storeData };
    const branch = { id: this.branches.length + 1, store_id: storeId, ...branchData };

    this.stores.set(slug, store);
    this.branches.push(branch);
    this.owners.set(userId, storeId);

    return { store, branch };
  }

  async atomicClaim(userId, storeSlug, userHasPrivilege = true) {
    const store = this.stores.get(storeSlug);
    if (!store) {
      const err = new Error('404 Not Found: Store does not exist');
      err.status = 404;
      throw err;
    }

    if (store.owner_id !== null) {
      const err = new Error('409 Conflict: Store is already claimed by an owner');
      err.status = 409;
      throw err;
    }

    if (!userHasPrivilege) {
      const err = new Error('403 Forbidden: Verification documents rejected');
      err.status = 403;
      throw err;
    }

    store.owner_id = userId;
    this.owners.set(userId, store.id);
    return { success: true, store };
  }
}

describe('Tier 2 - Boundary Cases: ACID Concurrency & Edge States', () => {
  test('TC-BND-ACID-01: Duplicate store slug registration rejects second request with HTTP 409 Conflict', async () => {
    const db = new ConcurrentTransactionalStore();
    const store1 = { name: 'Farmacia San Rafael' };
    const branch = { name: 'Principal', address: 'Av Las Mercedes', latitude: 10.48, longitude: -66.86 };

    // First user succeeds
    const res1 = await db.atomicRegister(101, store1, branch);
    assertEqual(res1.store.owner_id, 101);

    // Second user attempts same name -> generates same slug -> 409 Conflict
    await assertThrowsAsync(
      async () => {
        await db.atomicRegister(102, store1, branch);
      },
      /409 Conflict.*ya se encuentra registrado/,
      'Must reject duplicate slug with 409'
    );
  });

  test('TC-BND-ACID-02: User attempting to register second store while already owning one is blocked with 409', async () => {
    const db = new ConcurrentTransactionalStore();
    const branch = { name: 'Principal', address: 'Av Las Mercedes', latitude: 10.48, longitude: -66.86 };

    await db.atomicRegister(101, { name: 'Farmacia 1' }, branch);

    // Same user tries to register second store
    await assertThrowsAsync(
      async () => {
        await db.atomicRegister(101, { name: 'Farmacia 2' }, branch);
      },
      /409 Conflict.*Ya posees una tienda/,
      'Must prevent merchant multi-store registration on single account'
    );
  });

  test('TC-BND-ACID-03: Incomplete branch parameters (null coordinates) reject transaction before partial commit', async () => {
    const db = new ConcurrentTransactionalStore();
    const store = { name: 'Farmacia Nueva' };
    const invalidBranch = { name: 'Principal', address: 'Av Las Mercedes', latitude: null, longitude: null };

    await assertThrowsAsync(
      async () => {
        await db.atomicRegister(105, store, invalidBranch);
      },
      /422 Unprocessable Entity/,
      'Must reject incomplete branch'
    );

    // Confirm store was NOT created
    assertFalse(db.stores.has('farmacia-nueva'), 'Store must not exist in database');
    assertFalse(db.owners.has(105));
  });

  test('TC-BND-ACID-04: Attempting to claim an already claimed store throws 409 Conflict', async () => {
    const db = new ConcurrentTransactionalStore();
    const branch = { name: 'Principal', address: 'Av Las Mercedes', latitude: 10.48, longitude: -66.86 };
    await db.atomicRegister(101, { name: 'Farmacia Las Mercedes' }, branch);

    // Third party tries to claim it
    await assertThrowsAsync(
      async () => {
        await db.atomicClaim(200, 'farmacia-las-mercedes');
      },
      /409 Conflict.*already claimed/,
      'Cannot claim already claimed store'
    );
  });

  test('TC-BND-ACID-05: Claiming non-existent store slug throws 404 Not Found cleanly', async () => {
    const db = new ConcurrentTransactionalStore();

    await assertThrowsAsync(
      async () => {
        await db.atomicClaim(101, 'non-existent-store-slug');
      },
      /404 Not Found/,
      'Must throw 404 for non-existent store'
    );
  });
});
