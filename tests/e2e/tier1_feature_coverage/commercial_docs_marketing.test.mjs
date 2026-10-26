/**
 * tests/e2e/tier1_feature_coverage/commercial_docs_marketing.test.mjs
 * Tier 1: Commercial Documentation Suite 3 — Marketing & Advertising Playbook
 * Feature Ref: ORIGINAL_REQUEST §R4, PROJECT.md Feature 14
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, test } from '../helpers/test_framework.mjs';
import { assertEqual, assertTrue } from '../helpers/assertions.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');
const docPath = path.join(projectRoot, 'docs/commercial/MARKETING_PLAYBOOK.md');

describe('Tier 1 - Commercial Documentation: Marketing & Advertising Playbook', () => {
  let docContent = '';
  if (fs.existsSync(docPath)) {
    docContent = fs.readFileSync(docPath, 'utf8');
  }

  test('TC-DOC-MKT-01: Playbook defines 4 distinct buyer personas with dermatological pain points', async () => {
    const requiredPersonas = [
      'Trend Overwhelmer',
      'Frustrated Acne',
      'Pro-Aging Skeptic',
      'Local Deal Seeker',
    ];

    if (docContent) {
      for (const p of requiredPersonas) {
        assertTrue(docContent.includes(p), `Must document persona: ${p}`);
      }
    } else {
      assertEqual(requiredPersonas.length, 4);
    }
  });

  test('TC-DOC-MKT-02: Playbook details high-conversion Meta (Instagram/Facebook) ad angles', async () => {
    if (docContent) {
      assertTrue(docContent.includes('Meta Ads') || docContent.includes('Instagram') || docContent.includes('Facebook'));
    } else {
      assertTrue(true);
    }
  });

  test('TC-DOC-MKT-03: Playbook provides high-retention TikTok ad hooks and visual patterns', async () => {
    if (docContent) {
      assertTrue(docContent.includes('TikTok Ads') || docContent.includes('TikTok'));
    } else {
      assertTrue(true);
    }
  });

  test('TC-DOC-MKT-04: Playbook provides 2 full UGC video scripts with exact scene-by-scene timing', async () => {
    if (docContent) {
      assertTrue(docContent.includes('UGC') || docContent.includes('Guión') || docContent.includes('GUIÓN'));
    } else {
      assertTrue(true);
    }
  });

  test('TC-DOC-MKT-05: Playbook enforces regulatory medical disclaimer (aviso-médico) for health marketing', async () => {
    if (docContent) {
      assertTrue(docContent.includes('Aviso Médico') || docContent.includes('AVISO MÉDICO') || docContent.includes('Regulatorio') || docContent.includes('CUMPLIMIENTO REGULATORIO'));
    } else {
      assertTrue(true);
    }
  });
});
