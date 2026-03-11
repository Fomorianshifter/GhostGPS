/**
 * Tests for gpsIntegration service — URL building for third-party GPS apps.
 */

import { GPS_APPS } from '../src/services/gpsIntegration';
import { Coordinate } from '../src/types';

const origin: Coordinate = { latitude: 37.7749, longitude: -122.4194 };
const dest: Coordinate = { latitude: 34.0522, longitude: -118.2437 };

describe('GPS_APPS', () => {
  it('contains at least 7 apps', () => {
    expect(GPS_APPS.length).toBeGreaterThanOrEqual(7);
  });

  it('every app has required fields', () => {
    for (const app of GPS_APPS) {
      expect(app.id).toBeTruthy();
      expect(app.name).toBeTruthy();
      expect(app.icon).toBeTruthy();
      expect(app.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(typeof app.buildUrl).toBe('function');
      expect(typeof app.webFallback).toBe('function');
    }
  });

  it('Google Maps URL contains destination coordinates', () => {
    const gm = GPS_APPS.find(a => a.id === 'google_maps')!;
    const url = gm.buildUrl(origin, dest);
    expect(url).toContain(String(dest.latitude));
    expect(url).toContain(String(dest.longitude));
  });

  it('Waze URL targets destination', () => {
    const waze = GPS_APPS.find(a => a.id === 'waze')!;
    const url = waze.buildUrl(origin, dest);
    expect(url).toContain(String(dest.latitude));
    expect(url).toContain(String(dest.longitude));
    expect(url).toContain('navigate=yes');
  });

  it('Apple Maps URL uses saddr and daddr', () => {
    const apple = GPS_APPS.find(a => a.id === 'apple_maps')!;
    const url = apple.buildUrl(origin, dest);
    expect(url).toContain('saddr');
    expect(url).toContain('daddr');
  });

  it('web fallback URLs are valid http(s) URLs', () => {
    for (const app of GPS_APPS) {
      const url = app.webFallback(origin, dest);
      expect(url).toMatch(/^https?:\/\//);
    }
  });

  it('all app IDs are unique', () => {
    const ids = GPS_APPS.map(a => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
