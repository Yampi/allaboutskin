/**
 * tests/e2e/tier2_boundary_corner_cases/boundary_unicode_special_chars.test.mjs
 * Tier 2: Boundary & Corner Cases — Unicode, Special Characters & Sanitization
 * Feature Ref: ORIGINAL_REQUEST §R2, PROJECT.md Feature 6
 */

import { describe, test } from '../helpers/test_framework.mjs';
import { assertEqual, assertTrue, assertFalse } from '../helpers/assertions.mjs';

function sanitizeTextString(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .replace(/\0/g, '') // strip null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // strip control chars
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

describe('Tier 2 - Boundary Cases: Unicode & Special Character Integrity', () => {
  test('TC-BND-UNI-01: Correctly handles Spanish accents, tildes, and ñ in store names and locations', async () => {
    const spanishText = 'Farmacia San Ramón & Droguería La Asunción en Güigüe, Caña de Azúcar';
    const sanitized = sanitizeTextString(spanishText);

    assertEqual(sanitized, spanishText, 'Spanish diacritics must not be corrupted');
    assertTrue(sanitized.includes('Ramón'));
    assertTrue(sanitized.includes('Asunción'));
    assertTrue(sanitized.includes('Güigüe'));
    assertTrue(sanitized.includes('Caña'));
  });

  test('TC-BND-UNI-02: Safely handles Multilingual Asian & Middle Eastern characters (Chinese, Japanese, Arabic)', async () => {
    const multilingual = 'K-Beauty 肌研 (Hada Labo) / 日本製造 / ماء الورد';
    const sanitized = sanitizeTextString(multilingual);

    assertEqual(sanitized, multilingual);
    assertTrue(sanitized.includes('肌研'));
    assertTrue(sanitized.includes('ماء الورد'));
  });

  test('TC-BND-UNI-03: Null bytes and non-printable control characters are stripped safely', async () => {
    const dirty = 'Aqua\0, Niacinamide\x07, Glycerin\x1F';
    const sanitized = sanitizeTextString(dirty);

    assertEqual(sanitized, 'Aqua, Niacinamide, Glycerin');
    assertFalse(sanitized.includes('\0'));
    assertFalse(sanitized.includes('\x07'));
  });

  test('TC-BND-UNI-04: HTML entities are safely normalized to standard characters', async () => {
    const htmlEntityString = 'Beauty &amp; Science &quot;Premium&quot; &lt;Skin Care&gt;';
    const sanitized = sanitizeTextString(htmlEntityString);

    assertEqual(sanitized, 'Beauty & Science "Premium" <Skin Care>');
  });

  test('TC-BND-UNI-05: Unicode 4-byte Emojis preserve byte fidelity across storage boundaries', async () => {
    const emojiBrand = '✨ All About Skin 🌿 Glow Serum 🧴';
    const sanitized = sanitizeTextString(emojiBrand);

    assertEqual(sanitized, emojiBrand);
    assertTrue(sanitized.includes('✨'));
    assertTrue(sanitized.includes('🌿'));
    assertTrue(sanitized.includes('🧴'));
  });
});
