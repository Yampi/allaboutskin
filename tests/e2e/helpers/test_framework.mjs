/**
 * tests/e2e/helpers/test_framework.mjs
 * Lightweight, zero-dependency test definition and execution framework
 */

const registry = [];
let currentSuite = 'Global';

export function describe(suiteName, fn) {
  const previousSuite = currentSuite;
  currentSuite = suiteName;
  try {
    fn();
  } finally {
    currentSuite = previousSuite;
  }
}

export function test(name, fn) {
  registry.push({
    suite: currentSuite,
    name,
    fn,
  });
}

export function getRegistry() {
  return registry;
}

export function clearRegistry() {
  registry.length = 0;
}
