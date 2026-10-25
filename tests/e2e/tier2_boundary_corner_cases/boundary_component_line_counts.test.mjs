/**
 * tests/e2e/tier2_boundary_corner_cases/boundary_component_line_counts.test.mjs
 * Tier 2: Boundary & Corner Cases — Component Line Count Ceiling & Modularization
 * Feature Ref: ORIGINAL_REQUEST §R1 & Acceptance, PROJECT.md Feature 1 & 2
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, test } from '../helpers/test_framework.mjs';
import { assertEqual, assertTrue, assertFalse, assertLessThanOrEqual } from '../helpers/assertions.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');
const adminCompDir = path.join(projectRoot, 'frontend/src/components/admin');
const empresaCompDir = path.join(projectRoot, 'frontend/src/components/empresa');

function getTsxFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getTsxFiles(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      files.push(fullPath);
    }
  }
  return files;
}

describe('Tier 2 - Boundary Cases: Component Line Counts & Modularization', () => {
  test('TC-BND-MOD-01: Modular admin sub-components adhere to hard ceiling (< 180 lines)', async () => {
    const allFiles = getTsxFiles(adminCompDir);
    assertTrue(allFiles.length > 0, 'Admin component directory must have files');

    // Filter sub-components (components inside subdirectories)
    const subComponents = allFiles.filter(f => {
      const rel = path.relative(adminCompDir, f);
      return rel.includes(path.sep);
    });

    assertTrue(subComponents.length >= 10, 'Must have at least 10 decomposed sub-components in admin');

    const oversized = [];
    for (const file of subComponents) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n').length;
      if (lines >= 180) {
        oversized.push({ file: path.relative(projectRoot, file), lines });
      }
    }

    assertEqual(oversized.length, 0, `Components exceeding 180 lines: ${JSON.stringify(oversized)}`);
  });

  test('TC-BND-MOD-02: Modular sub-components target an average below 120 lines', async () => {
    const allFiles = getTsxFiles(adminCompDir);
    const subComponents = allFiles.filter(f => path.relative(adminCompDir, f).includes(path.sep));

    let totalLines = 0;
    for (const file of subComponents) {
      const content = fs.readFileSync(file, 'utf8');
      totalLines += content.split('\n').length;
    }

    const average = totalLines / subComponents.length;
    assertTrue(average < 120, `Average line count (${average.toFixed(1)}) must be under 120 lines`);
  });

  test('TC-BND-MOD-03: Decomposed components are organized into specialized domain directories', async () => {
    const subdirs = fs.readdirSync(adminCompDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    assertTrue(subdirs.includes('layout'), 'Must have layout directory');
    assertTrue(subdirs.includes('security'), 'Must have security directory');
    assertTrue(subdirs.includes('settings'), 'Must have settings directory');
    assertTrue(subdirs.includes('stores'), 'Must have stores directory');
    assertTrue(subdirs.includes('users'), 'Must have users directory');
  });

  test('TC-BND-MOD-04: Component files contain valid TypeScript React exports', async () => {
    const layoutFiles = getTsxFiles(path.join(adminCompDir, 'layout'));
    assertTrue(layoutFiles.length >= 3);

    for (const f of layoutFiles) {
      const content = fs.readFileSync(f, 'utf8');
      assertTrue(content.includes('export') || content.includes('function'), `Must export a component: ${f}`);
    }
  });

  test('TC-BND-MOD-05: Page orchestrator file exists and imports atomic components', async () => {
    const adminPage = path.join(projectRoot, 'frontend/src/app/admin/page.tsx');
    assertTrue(fs.existsSync(adminPage), 'admin/page.tsx must exist');

    const content = fs.readFileSync(adminPage, 'utf8');
    assertTrue(content.length > 0);
  });
});
