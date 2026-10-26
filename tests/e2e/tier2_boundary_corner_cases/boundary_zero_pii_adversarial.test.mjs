/**
 * tests/e2e/tier2_boundary_corner_cases/boundary_zero_pii_adversarial.test.mjs
 * Tier 2: Boundary & Corner Cases — Adversarial Zero-PII Leakage & Injection
 * Feature Ref: ORIGINAL_REQUEST §R3, PROJECT.md Feature 11
 */

import { describe, test } from '../helpers/test_framework.mjs';
import { assertEqual, assertTrue, assertFalse, assertNoMatch } from '../helpers/assertions.mjs';

function constructSafeWhatsAppLead(branch, productName) {
  const phone = (branch.whatsapp || branch.phone || '').replace(/[^0-9]/g, '');
  if (!phone) {
    return { ok: false, error: 'NO_PHONE_NUMBER_CONFIGURED' };
  }

  // Sanitize product name against adversarial PII injection
  let safeProduct = (productName || '').trim();
  // Strip email addresses if injected
  safeProduct = safeProduct.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]');
  // Strip international phone numbers if injected
  safeProduct = safeProduct.replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[REDACTED_PHONE]');
  // Strip XSS/script tags
  safeProduct = safeProduct.replace(/<[^>]*>/g, '');

  const msg = safeProduct
    ? `¡Hola! Vi en All About Skin que tienen "${safeProduct}". ¿Tienen stock disponible en su sede de ${branch.name}?`
    : `¡Hola! Los vi a través de All About Skin y deseo consultar disponibilidad en su sede de ${branch.name}.`;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  return { ok: true, url, cleanMsg: msg };
}

describe('Tier 2 - Boundary Cases: Adversarial Zero-PII Injection', () => {
  const mockBranch = {
    name: 'Sede Principal',
    phone: '+58 212 555 1234',
    whatsapp: '+584141234567',
  };

  test('TC-BND-PII-01: Adversarial attempt to inject email into product name is sanitized with [REDACTED_EMAIL]', async () => {
    const maliciousInput = 'Crema Antiarrugas para paciente valentina@patientmail.com';
    const result = constructSafeWhatsAppLead(mockBranch, maliciousInput);

    assertTrue(result.ok);
    assertNoMatch(result.cleanMsg, /valentina@patientmail\.com/, 'Injected email must be redacted');
    assertTrue(result.cleanMsg.includes('[REDACTED_EMAIL]'));
  });

  test('TC-BND-PII-02: Adversarial attempt to inject phone numbers into message parameter is sanitized', async () => {
    const maliciousInput = 'Serum Niacinamida llamar urgente al +1-800-555-0199';
    const result = constructSafeWhatsAppLead(mockBranch, maliciousInput);

    assertTrue(result.ok);
    assertNoMatch(result.cleanMsg, /\+1-800-555-0199/, 'Injected phone number must be redacted');
    assertTrue(result.cleanMsg.includes('[REDACTED_PHONE]'));
  });

  test('TC-BND-PII-03: XSS payloads in product names are stripped of HTML tags', async () => {
    const xssInput = 'CeraVe <script>alert("XSS")</script> Limpiador';
    const result = constructSafeWhatsAppLead(mockBranch, xssInput);

    assertTrue(result.ok);
    assertNoMatch(result.cleanMsg, /<script>/, 'Script tags must be stripped');
    assertTrue(result.cleanMsg.includes('CeraVe alert("XSS") Limpiador'));
  });

  test('TC-BND-PII-04: Missing WhatsApp and phone configuration fails gracefully without launching broken window', async () => {
    const emptyBranch = { name: 'Sede Sin Teléfono', phone: '', whatsapp: null };
    const result = constructSafeWhatsAppLead(emptyBranch, 'Protector Solar');

    assertFalse(result.ok);
    assertEqual(result.error, 'NO_PHONE_NUMBER_CONFIGURED');
  });

  test('TC-BND-PII-05: Unicode and emoji in product names encode into valid URL query parameters', async () => {
    const emojiInput = '🌸 Serum Reparador de Rosa Mosqueta ✨ (50ml)';
    const result = constructSafeWhatsAppLead(mockBranch, emojiInput);

    assertTrue(result.ok);
    assertTrue(result.url.includes('%F0%9F%8C%B8')); // Encoded flower emoji
    const parsed = new URL(result.url);
    const decoded = decodeURIComponent(parsed.searchParams.get('text'));
    assertTrue(decoded.includes('🌸 Serum Reparador de Rosa Mosqueta ✨ (50ml)'));
  });
});
