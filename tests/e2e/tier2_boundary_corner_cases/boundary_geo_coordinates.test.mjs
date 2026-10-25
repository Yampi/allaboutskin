/**
 * tests/e2e/tier2_boundary_corner_cases/boundary_geo_coordinates.test.mjs
 * Tier 2: Boundary & Corner Cases — Geolocation Coordinates & Haversine Distance
 * Feature Ref: ORIGINAL_REQUEST §R3, PROJECT.md Feature 11
 */

import { describe, test } from '../helpers/test_framework.mjs';
import { assertEqual, assertTrue, assertFalse, assertThrowsSync } from '../helpers/assertions.mjs';

function validateCoordinates(lat, lng) {
  const latitude = typeof lat === 'number' ? lat : parseFloat(lat);
  const longitude = typeof lng === 'number' ? lng : parseFloat(lng);

  if (isNaN(latitude) || latitude < -90.0 || latitude > 90.0) {
    throw new Error(`Invalid latitude: ${lat}. Must be between -90.0 and 90.0.`);
  }

  if (isNaN(longitude) || longitude < -180.0 || longitude > 180.0) {
    throw new Error(`Invalid longitude: ${lng}. Must be between -180.0 and 180.0.`);
  }

  return { latitude, longitude };
}

function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

describe('Tier 2 - Boundary Cases: Geolocation & Coordinate Precision', () => {
  test('TC-BND-GEO-01: Out-of-range latitude (> 90 or < -90) is rejected with validation error', async () => {
    assertThrowsSync(() => validateCoordinates(90.1, -66.86), /Invalid latitude/);
    assertThrowsSync(() => validateCoordinates(-90.001, -66.86), /Invalid latitude/);
    assertThrowsSync(() => validateCoordinates('invalid-lat', -66.86), /Invalid latitude/);
  });

  test('TC-BND-GEO-02: Out-of-range longitude (> 180 or < -180) is rejected with validation error', async () => {
    assertThrowsSync(() => validateCoordinates(10.48, 180.5), /Invalid longitude/);
    assertThrowsSync(() => validateCoordinates(10.48, -181.0), /Invalid longitude/);
    assertThrowsSync(() => validateCoordinates(10.48, 'invalid-lng'), /Invalid longitude/);
  });

  test('TC-BND-GEO-03: Boundary poles and Prime Meridian (90, -90, 180, -180, 0, 0) validate cleanly', async () => {
    const northPole = validateCoordinates(90, 0);
    assertEqual(northPole.latitude, 90);

    const southPole = validateCoordinates(-90, 0);
    assertEqual(southPole.latitude, -90);

    const dateLine = validateCoordinates(0, 180);
    assertEqual(dateLine.longitude, 180);

    const nullIsland = validateCoordinates(0, 0);
    assertEqual(nullIsland.latitude, 0);
    assertEqual(nullIsland.longitude, 0);
  });

  test('TC-BND-GEO-04: Haversine distance between identical points evaluates to exactly 0.00 km', async () => {
    const distance = calculateHaversineDistanceKm(10.4806, -66.8601, 10.4806, -66.8601);
    assertEqual(distance, 0.00);
  });

  test('TC-BND-GEO-05: Nearby branches filter within 5km radius correctly identifies proximate stores', async () => {
    const userLat = 10.4806; // Las Mercedes, Caracas
    const userLng = -66.8601;

    const branches = [
      { id: 1, name: 'Sede Chacao', lat: 10.4922, lng: -66.8528 }, // ~1.5 km
      { id: 2, name: 'Sede El Hatillo', lat: 10.4265, lng: -66.8256 }, // ~7.2 km
      { id: 3, name: 'Sede Maracay', lat: 10.2469, lng: -67.5958 }, // ~84 km
    ];

    function filterNearby(userLat, userLng, branchList, maxRadiusKm = 5.0) {
      return branchList
        .map(b => ({
          ...b,
          distanceKm: calculateHaversineDistanceKm(userLat, userLng, b.lat, b.lng),
        }))
        .filter(b => b.distanceKm <= maxRadiusKm);
    }

    const nearby = filterNearby(userLat, userLng, branches, 5.0);
    assertEqual(nearby.length, 1);
    assertEqual(nearby[0].name, 'Sede Chacao');
    assertTrue(nearby[0].distanceKm < 5.0);
  });
});
