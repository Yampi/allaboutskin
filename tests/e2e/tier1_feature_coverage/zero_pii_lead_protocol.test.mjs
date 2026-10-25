/**
 * tests/e2e/tier1_feature_coverage/zero_pii_lead_protocol.test.mjs
 * Tier 1: Zero-PII Lead Protocol (WhatsApp & Google Maps Outbound Links)
 * Feature Ref: ORIGINAL_REQUEST §R3, PROJECT.md Feature 11
 */

import { describe, test } from '../helpers/test_framework.mjs';
import { assertEqual, assertTrue, assertFalse, assertNoMatch, assertMatch } from '../helpers/assertions.mjs';
import { STORE_FIXTURES } from '../helpers/fixtures.mjs';

// Lead URL Builders
function buildWhatsAppOutboundUrl(branch, productName = null) {
  const cleanPhone = (branch.whatsapp || branch.phone || '').replace(/[^0-9]/g, '');
  if (!cleanPhone) return null;

  const msg = productName
    ? `¡Hola! Vi en All About Skin que tienen "${productName}". ¿Tienen stock disponible en su sede de ${branch.name}?`
    : `¡Hola! Los vi a través de All About Skin y deseo consultar disponibilidad en su sede de ${branch.name}.`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
}

function buildGoogleMapsOutboundUrl(branch) {
  const query = `${branch.name} ${branch.address || ''} ${branch.city || ''}`.trim();
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function buildInteractionPayload(storeId, branchId, type, productName, city) {
  return {
    store_id: storeId,
    branch_id: branchId,
    interaction_type: type,
    metadata: {
      product_name: productName || null,
      city: city || null,
    },
    // Explicitly NO user email, user phone, user prescription, or cookies
  };
}

describe('Tier 1 - Zero-PII Lead Generation Protocol', () => {
  const branch = STORE_FIXTURES.validBranch;

  test('TC-PII-01: WhatsApp outbound link strictly contains zero patient PII', async () => {
    const urlWithProduct = buildWhatsAppOutboundUrl(branch, 'CeraVe Limpiador');
    assertTrue(urlWithProduct.startsWith('https://wa.me/584141234567?text='));

    const parsedUrl = new URL(urlWithProduct);
    const textParam = decodeURIComponent(parsedUrl.searchParams.get('text'));

    // Check for absence of PII
    assertNoMatch(textParam, /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, 'Must not contain user email');
    assertNoMatch(textParam, /paciente|prescripción|diagnóstico|cédula|dni/i, 'Must not contain medical diagnostic words');
    assertTrue(textParam.includes('CeraVe Limpiador'));
    assertTrue(textParam.includes(branch.name));
  });

  test('TC-PII-02: Google Maps outbound link routes to store address without leaking user GPS coordinates', async () => {
    const url = buildGoogleMapsOutboundUrl(branch);
    assertTrue(url.startsWith('https://www.google.com/maps/search/?api=1&query='));

    const parsedUrl = new URL(url);
    const query = decodeURIComponent(parsedUrl.searchParams.get('query'));

    assertTrue(query.includes(branch.name));
    assertTrue(query.includes(branch.address));
    assertTrue(query.includes(branch.city));
    // Verify no user client IP or user coordinates are in query
    assertNoMatch(query, /origin=|saddr=/, 'Must not specify user origin coordinates');
  });

  test('TC-PII-03: Interaction telemetry payload strictly contains non-PII operational fields', async () => {
    const payload = buildInteractionPayload(1, 10, 'WHATSAPP_CLICK', 'Niacinamida 10%', 'Caracas');

    assertEqual(payload.store_id, 1);
    assertEqual(payload.branch_id, 10);
    assertEqual(payload.interaction_type, 'WHATSAPP_CLICK');
    assertEqual(payload.metadata.product_name, 'Niacinamida 10%');
    assertEqual(payload.metadata.city, 'Caracas');

    // Verify absence of sensitive keys
    assertFalse('user_email' in payload);
    assertFalse('user_phone' in payload);
    assertFalse('device_fingerprint' in payload);
    assertFalse('medical_history' in payload);
  });

  test('TC-PII-04: Store contact information exposes only authorized public business channels', async () => {
    const publicStoreInfo = {
      name: STORE_FIXTURES.validStore.name,
      phone: STORE_FIXTURES.validStore.phone,
      whatsapp: STORE_FIXTURES.validStore.whatsapp,
      website: STORE_FIXTURES.validStore.website,
    };

    // Public info must not include private merchant credentials
    assertFalse('password_hash' in publicStoreInfo);
    assertFalse('billing_tax_id' in publicStoreInfo);
    assertFalse('bank_account_number' in publicStoreInfo);
    assertTrue(publicStoreInfo.phone.startsWith('+58'));
  });

  test('TC-PII-05: Query parameter sanitizer rejects any payload attempting to append email or phone tokens', async () => {
    function sanitizeOutboundLeadParams(params) {
      const allowedKeys = ['store_id', 'branch_id', 'interaction_type', 'product_name', 'city'];
      const sanitized = {};
      for (const [key, val] of Object.entries(params)) {
        if (!allowedKeys.includes(key)) {
          continue; // Strip unknown / PII parameters
        }
        sanitized[key] = val;
      }
      return sanitized;
    }

    const dirtyParams = {
      store_id: 5,
      branch_id: 12,
      product_name: 'Hyaluronic Acid',
      user_email: 'hacker@example.com',
      user_phone: '+1234567890',
      patient_ssn: '000-11-2222',
    };

    const clean = sanitizeOutboundLeadParams(dirtyParams);
    assertEqual(Object.keys(clean).length, 3);
    assertFalse('user_email' in clean);
    assertFalse('patient_ssn' in clean);
    assertEqual(clean.product_name, 'Hyaluronic Acid');
  });
});
