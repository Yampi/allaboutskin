/**
 * tests/e2e/tier2_boundary_corner_cases/boundary_docs_integrity.test.mjs
 * Tier 2: Boundary & Corner Cases — Strategic Commercial Documentation Structural Integrity
 * Feature Ref: ORIGINAL_REQUEST §R4, PROJECT.md Features 12-15
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, test } from '../helpers/test_framework.mjs';
import { assertEqual, assertTrue, assertFalse, assertGreaterThanOrEqual } from '../helpers/assertions.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');
const docsDir = path.join(projectRoot, 'docs/commercial');

const DOC_FILES = [
  'B2C_END_USER_GUIDE.md',
  'B2B_MERCHANT_KIT.md',
  'MARKETING_PLAYBOOK.md',
  'INVESTOR_DUE_DILIGENCE_DOSSIER.md',
];

describe('Tier 2 - Boundary Cases: Documentation Structural Integrity', () => {
  test('TC-BND-DOC-01: All 4 documentation packages exist as standalone files in docs/commercial/', async () => {
    assertTrue(fs.existsSync(docsDir), 'docs/commercial directory must exist');
    for (const filename of DOC_FILES) {
      const fullPath = path.join(docsDir, filename);
      assertTrue(fs.existsSync(fullPath), `File ${filename} must exist`);
    }
  });

  test('TC-BND-DOC-02: Every documentation package exceeds 200 lines of rigorous commercial depth', async () => {
    for (const filename of DOC_FILES) {
      const fullPath = path.join(docsDir, filename);
      const content = fs.readFileSync(fullPath, 'utf8');
      const lineCount = content.split('\n').length;
      assertGreaterThanOrEqual(lineCount, 200, `${filename} (${lineCount} lines) must exceed 200 lines`);
    }
  });

  test('TC-BND-DOC-03: Every documentation suite contains formatted tables (Markdown pipe or Unicode matrix)', async () => {
    for (const filename of DOC_FILES) {
      const fullPath = path.join(docsDir, filename);
      const content = fs.readFileSync(fullPath, 'utf8');
      const hasTable = /\|[\s-:]+\|[\s-:]+\|/.test(content) || /[┌├][─┬┼]+[┐┤]/.test(content);
      assertTrue(hasTable, `${filename} must contain formatted tables`);
    }
  });

  test('TC-BND-DOC-04: Documents contain zero unresolved [TODO] or [TBD] placeholders', async () => {
    for (const filename of DOC_FILES) {
      const fullPath = path.join(docsDir, filename);
      const content = fs.readFileSync(fullPath, 'utf8');
      assertFalse(/\[TODO\]/i.test(content), `${filename} must not contain [TODO] placeholders`);
      assertFalse(/\[TBD\]/i.test(content), `${filename} must not contain [TBD] placeholders`);
    }
  });

  test('TC-BND-DOC-05: Every document contains formal metadata header (Platform, Version, Classification)', async () => {
    for (const filename of DOC_FILES) {
      const fullPath = path.join(docsDir, filename);
      const content = fs.readFileSync(fullPath, 'utf8');
      assertTrue(content.includes('Allabout.skin'), `${filename} must reference Allabout.skin platform`);
      assertTrue(/Versi[oó]n/i.test(content), `${filename} must specify version`);
      assertTrue(/Clasificaci[oó]n/i.test(content), `${filename} must specify classification`);
    }
  });
});
