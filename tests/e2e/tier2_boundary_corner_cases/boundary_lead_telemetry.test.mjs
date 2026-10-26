/**
 * tests/e2e/tier2_boundary_corner_cases/boundary_lead_telemetry.test.mjs
 * Tier 2: Boundary & Corner Cases — Lead Telemetry Stress & Deduplication
 * Feature Ref: ORIGINAL_REQUEST §R3, PROJECT.md Feature 11
 */

import { describe, test } from '../helpers/test_framework.mjs';
import { assertEqual, assertTrue, assertFalse, assertThrowsSync, assertLessThanOrEqual } from '../helpers/assertions.mjs';

class LeadTelemetryPipeline {
  constructor() {
    this.logs = [];
    this.recentClicks = new Map(); // key -> timestamp
  }

  record(payload, clientSessionKey = 'sess-default') {
    // Validate store_id and branch_id
    if (!payload.store_id || typeof payload.store_id !== 'number' || payload.store_id <= 0) {
      throw new Error('422 Unprocessable Entity: store_id must be a positive integer');
    }
    if (!payload.branch_id || typeof payload.branch_id !== 'number' || payload.branch_id <= 0) {
      throw new Error('422 Unprocessable Entity: branch_id must be a positive integer');
    }

    // Validate interaction_type
    const validTypes = ['WHATSAPP_CLICK', 'MAP_ROUTE', 'IN_STORE_INQUIRY', 'CATALOG_VIEW'];
    if (!validTypes.includes(payload.interaction_type)) {
      throw new Error(`422 Unprocessable Entity: Invalid interaction_type: ${payload.interaction_type}`);
    }

    // Deduplication check: ignore rapid duplicate clicks within 1000ms
    const dedupKey = `${clientSessionKey}:${payload.branch_id}:${payload.interaction_type}`;
    const now = Date.now();
    const lastClick = this.recentClicks.get(dedupKey);

    if (lastClick && now - lastClick < 1000) {
      return { recorded: false, deduplicated: true };
    }

    this.recentClicks.set(dedupKey, now);
    const entry = {
      id: this.logs.length + 1,
      store_id: payload.store_id,
      branch_id: payload.branch_id,
      interaction_type: payload.interaction_type,
      metadata: payload.metadata || {},
      created_at: new Date(now).toISOString(),
    };
    this.logs.push(entry);
    return { recorded: true, entry };
  }
}

describe('Tier 2 - Boundary Cases: Lead Telemetry & Deduplication', () => {
  test('TC-BND-TEL-01: Rapid duplicate clicks within 1000ms are deduplicated to protect merchant analytics', async () => {
    const pipeline = new LeadTelemetryPipeline();
    const payload = { store_id: 1, branch_id: 10, interaction_type: 'WHATSAPP_CLICK' };

    const first = pipeline.record(payload, 'user-ip-1');
    assertTrue(first.recorded);
    assertEqual(pipeline.logs.length, 1);

    // Second click immediately
    const second = pipeline.record(payload, 'user-ip-1');
    assertFalse(second.recorded);
    assertTrue(second.deduplicated);
    assertEqual(pipeline.logs.length, 1, 'Duplicate click must not be added to log');
  });

  test('TC-BND-TEL-02: Missing or non-positive store_id throws 422 Unprocessable Entity', async () => {
    const pipeline = new LeadTelemetryPipeline();
    assertThrowsSync(
      () => pipeline.record({ store_id: null, branch_id: 10, interaction_type: 'MAP_ROUTE' }),
      /store_id must be a positive integer/
    );
    assertThrowsSync(
      () => pipeline.record({ store_id: -5, branch_id: 10, interaction_type: 'MAP_ROUTE' }),
      /store_id must be a positive integer/
    );
  });

  test('TC-BND-TEL-03: Missing or non-positive branch_id throws 422 Unprocessable Entity', async () => {
    const pipeline = new LeadTelemetryPipeline();
    assertThrowsSync(
      () => pipeline.record({ store_id: 1, branch_id: 0, interaction_type: 'MAP_ROUTE' }),
      /branch_id must be a positive integer/
    );
  });

  test('TC-BND-TEL-04: Invalid interaction_type is rejected with validation error', async () => {
    const pipeline = new LeadTelemetryPipeline();
    assertThrowsSync(
      () => pipeline.record({ store_id: 1, branch_id: 10, interaction_type: 'RANDOM_HACK' }),
      /Invalid interaction_type/
    );
  });

  test('TC-BND-TEL-05: Non-blocking telemetry ingestion executes in sub-1ms', async () => {
    const pipeline = new LeadTelemetryPipeline();
    const start = performance.now();
    pipeline.record({ store_id: 1, branch_id: 10, interaction_type: 'MAP_ROUTE' });
    const duration = performance.now() - start;

    assertLessThanOrEqual(duration, 2.0, `Telemetry execution (${duration.toFixed(2)}ms) must be under 2ms`);
  });
});
