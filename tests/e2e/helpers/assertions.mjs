/**
 * tests/e2e/helpers/assertions.mjs
 * Comprehensive assertion utilities for opaque-box E2E testing
 */

import assert from 'node:assert/strict';

export function assertEqual(actual, expected, message = '') {
  assert.strictEqual(actual, expected, message || `Expected ${JSON.stringify(actual)} to strictly equal ${JSON.stringify(expected)}`);
}

export function assertDeepEqual(actual, expected, message = '') {
  assert.deepStrictEqual(actual, expected, message || `Expected deep equality between objects`);
}

export function assertTrue(value, message = '') {
  assert.strictEqual(Boolean(value), true, message || `Expected value to be true, got ${value}`);
}

export function assertFalse(value, message = '') {
  assert.strictEqual(Boolean(value), false, message || `Expected value to be false, got ${value}`);
}

export function assertMatch(actual, regex, message = '') {
  assert.match(String(actual), regex, message || `Expected "${actual}" to match pattern ${regex}`);
}

export function assertNoMatch(actual, regex, message = '') {
  const matches = regex.test(String(actual));
  assert.strictEqual(matches, false, message || `Expected "${actual}" NOT to match pattern ${regex}`);
}

export function assertLessThanOrEqual(actual, max, message = '') {
  assert.ok(actual <= max, message || `Expected ${actual} to be <= ${max}`);
}

export function assertGreaterThanOrEqual(actual, min, message = '') {
  assert.ok(actual >= min, message || `Expected ${actual} to be >= ${min}`);
}

export async function assertThrowsAsync(asyncFn, errorValidator, message = '') {
  let threw = false;
  try {
    await asyncFn();
  } catch (err) {
    threw = true;
    if (typeof errorValidator === 'function') {
      assertTrue(errorValidator(err), message || `Error failed custom validation: ${err.message}`);
    } else if (errorValidator instanceof RegExp) {
      assertMatch(err.message, errorValidator, message);
    }
  }
  assertTrue(threw, message || `Expected asynchronous function to throw an error, but it succeeded.`);
}

export function assertThrowsSync(fn, errorValidator, message = '') {
  let threw = false;
  try {
    fn();
  } catch (err) {
    threw = true;
    if (typeof errorValidator === 'function') {
      assertTrue(errorValidator(err), message || `Error failed custom validation: ${err.message}`);
    } else if (errorValidator instanceof RegExp) {
      assertMatch(err.message, errorValidator, message);
    }
  }
  assertTrue(threw, message || `Expected synchronous function to throw an error, but it succeeded.`);
}
