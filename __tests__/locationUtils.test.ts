/**
 * Tests for locationUtils — pure math helpers used by the route simulator.
 */

import {
  haversineDistance,
  calculateBearing,
  destinationPoint,
  interpolatePosition,
  mphToMetersPerSecond,
  metersPerSecondToMph,
  metersToMiles,
  secondsToHumanReadable,
  polylineToSteps,
} from '../src/utils/locationUtils';
import { Coordinate, Route } from '../src/types';

describe('haversineDistance', () => {
  it('returns 0 for identical coordinates', () => {
    const point: Coordinate = { latitude: 37.7749, longitude: -122.4194 };
    expect(haversineDistance(point, point)).toBeCloseTo(0, 1);
  });

  it('calculates ~111 km between 1 degree of latitude', () => {
    const a: Coordinate = { latitude: 0, longitude: 0 };
    const b: Coordinate = { latitude: 1, longitude: 0 };
    expect(haversineDistance(a, b)).toBeCloseTo(111195, -2);
  });

  it('calculates distance between SF and Oakland (~12 km)', () => {
    const sf: Coordinate = { latitude: 37.7749, longitude: -122.4194 };
    const oak: Coordinate = { latitude: 37.8044, longitude: -122.2712 };
    const dist = haversineDistance(sf, oak);
    // Real distance ~12.4 km
    expect(dist).toBeGreaterThan(12000);
    expect(dist).toBeLessThan(14000);
  });
});

describe('calculateBearing', () => {
  it('returns 0° heading north', () => {
    const a: Coordinate = { latitude: 0, longitude: 0 };
    const b: Coordinate = { latitude: 1, longitude: 0 };
    expect(calculateBearing(a, b)).toBeCloseTo(0, 0);
  });

  it('returns 90° heading east', () => {
    const a: Coordinate = { latitude: 0, longitude: 0 };
    const b: Coordinate = { latitude: 0, longitude: 1 };
    expect(calculateBearing(a, b)).toBeCloseTo(90, 0);
  });

  it('returns 180° heading south', () => {
    const a: Coordinate = { latitude: 1, longitude: 0 };
    const b: Coordinate = { latitude: 0, longitude: 0 };
    expect(calculateBearing(a, b)).toBeCloseTo(180, 0);
  });

  it('returns 270° heading west', () => {
    const a: Coordinate = { latitude: 0, longitude: 1 };
    const b: Coordinate = { latitude: 0, longitude: 0 };
    expect(calculateBearing(a, b)).toBeCloseTo(270, 0);
  });
});

describe('destinationPoint', () => {
  it('returns origin when distance is 0', () => {
    const origin: Coordinate = { latitude: 37.7749, longitude: -122.4194 };
    const result = destinationPoint(origin, 0, 0);
    expect(result.latitude).toBeCloseTo(origin.latitude, 5);
    expect(result.longitude).toBeCloseTo(origin.longitude, 5);
  });

  it('moves north by ~1 km', () => {
    const origin: Coordinate = { latitude: 0, longitude: 0 };
    const result = destinationPoint(origin, 0, 1000);
    expect(result.latitude).toBeGreaterThan(origin.latitude);
    expect(result.longitude).toBeCloseTo(origin.longitude, 3);
  });

  it('is consistent with haversine round-trip', () => {
    const origin: Coordinate = { latitude: 37.7749, longitude: -122.4194 };
    const bearing = 45;
    const distance = 5000;
    const dest = destinationPoint(origin, bearing, distance);
    const roundTrip = haversineDistance(origin, dest);
    expect(roundTrip).toBeCloseTo(distance, -1);
  });
});

describe('polylineToSteps', () => {
  it('returns empty array for empty polyline', () => {
    expect(polylineToSteps([])).toHaveLength(0);
  });

  it('returns single step for one-point polyline', () => {
    const p: Coordinate = { latitude: 1, longitude: 1 };
    const steps = polylineToSteps([p]);
    expect(steps).toHaveLength(1);
    expect(steps[0].distanceMeters).toBe(0);
  });

  it('computes correct step count for two-point polyline', () => {
    const a: Coordinate = { latitude: 0, longitude: 0 };
    const b: Coordinate = { latitude: 0, longitude: 1 };
    const steps = polylineToSteps([a, b]);
    expect(steps).toHaveLength(2);
    expect(steps[0].distanceMeters).toBeGreaterThan(0);
    expect(steps[1].distanceMeters).toBe(0);
  });
});

describe('interpolatePosition', () => {
  const buildRoute = (coords: Coordinate[]): Route => {
    const steps = polylineToSteps(coords);
    const total = steps.reduce((acc, s) => acc + s.distanceMeters, 0);
    return {
      steps,
      polyline: coords,
      totalDistanceMeters: total,
      totalDurationSeconds: total / 10,
    };
  };

  it('returns origin when progress is 0', () => {
    const a: Coordinate = { latitude: 0, longitude: 0 };
    const b: Coordinate = { latitude: 0, longitude: 1 };
    const route = buildRoute([a, b]);
    const { coordinate } = interpolatePosition(route, 0);
    expect(coordinate.latitude).toBeCloseTo(a.latitude, 4);
    expect(coordinate.longitude).toBeCloseTo(a.longitude, 4);
  });

  it('returns destination when progress >= total distance', () => {
    const a: Coordinate = { latitude: 0, longitude: 0 };
    const b: Coordinate = { latitude: 0, longitude: 1 };
    const route = buildRoute([a, b]);
    const { coordinate } = interpolatePosition(route, route.totalDistanceMeters + 100);
    expect(coordinate.latitude).toBeCloseTo(b.latitude, 4);
    expect(coordinate.longitude).toBeCloseTo(b.longitude, 4);
  });

  it('returns midpoint at half distance', () => {
    const a: Coordinate = { latitude: 0, longitude: 0 };
    const b: Coordinate = { latitude: 0, longitude: 2 };
    const route = buildRoute([a, b]);
    const { coordinate } = interpolatePosition(route, route.totalDistanceMeters / 2);
    expect(coordinate.longitude).toBeCloseTo(1, 1);
  });
});

describe('unit conversion helpers', () => {
  test('mphToMetersPerSecond: 0 mph → 0 m/s', () => {
    expect(mphToMetersPerSecond(0)).toBe(0);
  });

  test('mphToMetersPerSecond: 60 mph → ~26.8 m/s', () => {
    expect(mphToMetersPerSecond(60)).toBeCloseTo(26.8224, 1);
  });

  test('metersPerSecondToMph is inverse of mphToMetersPerSecond', () => {
    const mph = 45;
    expect(metersPerSecondToMph(mphToMetersPerSecond(mph))).toBeCloseTo(mph, 5);
  });

  test('metersToMiles: 1609 m ≈ 1 mile', () => {
    expect(metersToMiles(1609.344)).toBeCloseTo(1, 3);
  });
});

describe('secondsToHumanReadable', () => {
  test('seconds only', () => {
    expect(secondsToHumanReadable(45)).toBe('45s');
  });

  test('minutes and seconds', () => {
    expect(secondsToHumanReadable(90)).toBe('1m 30s');
  });

  test('hours and minutes', () => {
    expect(secondsToHumanReadable(3661)).toBe('1h 1m');
  });

  test('zero seconds', () => {
    expect(secondsToHumanReadable(0)).toBe('0s');
  });
});
