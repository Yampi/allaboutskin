#!/usr/bin/env node
/**
 * tests/e2e/runner.mjs
 * Main E2E Test Suite Runner for Allabout.skin Commercial Platform
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';
import { getRegistry, clearRegistry } from './helpers/test_framework.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse CLI args
const args = process.argv.slice(2);
let tierFilter = null;
let grepFilter = null;
let fileFilter = null;
let verbose = false;

for (const arg of args) {
  if (arg.startsWith('--tier=')) {
    tierFilter = arg.split('=')[1].toLowerCase();
  } else if (arg.startsWith('--grep=')) {
    grepFilter = new RegExp(arg.split('=')[1], 'i');
  } else if (arg.startsWith('--file=')) {
    fileFilter = arg.split('=')[1].toLowerCase();
  } else if (arg === '--verbose' || arg === '-v') {
    verbose = true;
  }
}

const TIER_DIRECTORIES = [
  { id: 'tier1', name: 'Tier 1: Feature Coverage', dir: path.join(__dirname, 'tier1_feature_coverage') },
  { id: 'tier2', name: 'Tier 2: Boundary & Corner Cases', dir: path.join(__dirname, 'tier2_boundary_corner_cases') },
  { id: 'tier3', name: 'Tier 3: Cross-Feature Combinations', dir: path.join(__dirname, 'tier3_cross_feature_combinations') },
  { id: 'tier4', name: 'Tier 4: Real-World Application Scenarios', dir: path.join(__dirname, 'tier4_real_world_application_scenarios') },
];

function collectTestFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTestFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.test.mjs')) {
      files.push(fullPath);
    }
  }
  return files.sort();
}

async function run() {
  console.log('\n================================================================================');
  console.log('       ALLABOUT.SKIN E2E REQUIREMENT-DRIVEN TEST SUITE RUNNER');
  console.log('================================================================================');
  console.log(`Node Runtime: ${process.version} | Platform: ${process.platform}`);
  console.log(`Execution Time: ${new Date().toISOString()}`);
  if (tierFilter) console.log(`Active Tier Filter: ${tierFilter}`);
  if (grepFilter) console.log(`Active Grep Filter: ${grepFilter}`);
  if (fileFilter) console.log(`Active File Filter: ${fileFilter}`);
  console.log('--------------------------------------------------------------------------------\n');

  const overallStart = performance.now();
  const tierResults = [];
  let globalPassed = 0;
  let globalFailed = 0;
  const failureDetails = [];

  for (const tier of TIER_DIRECTORIES) {
    if (tierFilter && !tier.id.includes(tierFilter) && !tier.name.toLowerCase().includes(tierFilter)) {
      continue;
    }

    const testFiles = collectTestFiles(tier.dir).filter((file) => {
      if (fileFilter && !path.basename(file).toLowerCase().includes(fileFilter)) {
        return false;
      }
      return true;
    });

    if (testFiles.length === 0) continue;

    console.log(`\n>>> [${tier.name.toUpperCase()}] (${testFiles.length} test suites)`);
    console.log('─'.repeat(80));

    const tierStart = performance.now();
    let tierPassed = 0;
    let tierFailed = 0;

    for (const testFile of testFiles) {
      const relPath = path.relative(__dirname, testFile);
      clearRegistry();

      try {
        const fileUrl = pathToFileURL(testFile).href;
        await import(fileUrl);
      } catch (importErr) {
        tierFailed++;
        globalFailed++;
        console.log(`  ✗ [LOAD ERROR] ${relPath}: ${importErr.message}`);
        failureDetails.push({
          file: relPath,
          suite: 'Module Import',
          name: 'Dynamic import',
          error: importErr,
        });
        continue;
      }

      const tests = getRegistry();
      const filteredTests = tests.filter((t) => {
        if (grepFilter && !grepFilter.test(`${t.suite} ${t.name}`)) {
          return false;
        }
        return true;
      });

      if (filteredTests.length === 0) continue;

      console.log(`  • Suite: ${relPath} (${filteredTests.length} tests)`);

      for (const t of filteredTests) {
        const testStart = performance.now();
        try {
          await t.fn();
          const duration = (performance.now() - testStart).toFixed(1);
          tierPassed++;
          globalPassed++;
          console.log(`    ✓ [PASS] (${duration}ms) ${t.name}`);
        } catch (err) {
          const duration = (performance.now() - testStart).toFixed(1);
          tierFailed++;
          globalFailed++;
          console.log(`    ✗ [FAIL] (${duration}ms) ${t.name}`);
          console.log(`      Error: ${err.message}`);
          failureDetails.push({
            file: relPath,
            suite: t.suite,
            name: t.name,
            error: err,
          });
        }
      }
    }

    const tierDuration = (performance.now() - tierStart).toFixed(1);
    tierResults.push({
      id: tier.id,
      name: tier.name,
      files: testFiles.length,
      passed: tierPassed,
      failed: tierFailed,
      duration: tierDuration,
    });
  }

  const overallDuration = (performance.now() - overallStart).toFixed(1);

  console.log('\n\n================================================================================');
  console.log('                             TEST EXECUTION SUMMARY');
  console.log('================================================================================');
  console.log('Tier                                | Files | Passed | Failed | Duration');
  console.log('------------------------------------+-------+--------+--------+-------------');
  for (const tr of tierResults) {
    const namePadded = tr.name.padEnd(35);
    const filesPadded = String(tr.files).padStart(5);
    const passedPadded = String(tr.passed).padStart(6);
    const failedPadded = String(tr.failed).padStart(6);
    const durationPadded = `${tr.duration}ms`.padStart(11);
    console.log(`${namePadded} | ${filesPadded} | ${passedPadded} | ${failedPadded} | ${durationPadded}`);
  }
  console.log('------------------------------------+-------+--------+--------+-------------');
  const totalTests = globalPassed + globalFailed;
  console.log(`TOTALS: ${totalTests} tests across ${tierResults.reduce((a, b) => a + b.files, 0)} files in ${overallDuration}ms`);
  console.log(`PASSED: ${globalPassed} (${totalTests > 0 ? ((globalPassed / totalTests) * 100).toFixed(1) : 0}%)`);
  console.log(`FAILED: ${globalFailed}`);
  console.log('================================================================================\n');

  if (failureDetails.length > 0) {
    console.log('\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.log('                               FAILURE DETAILS');
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    failureDetails.forEach((f, idx) => {
      console.log(`\n[${idx + 1}] File: ${f.file}`);
      console.log(`    Suite: ${f.suite}`);
      console.log(`    Test:  ${f.name}`);
      console.log(`    Error: ${f.error.message}`);
      if (f.error.stack && verbose) {
        console.log(`    Stack:\n${f.error.stack.split('\n').map(l => '      ' + l).join('\n')}`);
      }
    });
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n');
    process.exit(1);
  } else {
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! 100% PASS RATE ACHIEVED.\n');
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('Fatal Runner Exception:', err);
  process.exit(1);
});
