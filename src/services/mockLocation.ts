import { NativeModules, Platform } from 'react-native';
import { Coordinate } from '../types';

const { MockLocationModule } = NativeModules;

export interface MockLocationOptions {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  bearing?: number;
  speed?: number;
}

/**
 * Check if mock location is available (Android only).
 */
export function isMockLocationSupported(): boolean {
  return Platform.OS === 'android' && !!MockLocationModule;
}

/**
 * Start the mock location provider. Must be called once before setMockLocation.
 * Requires "Allow mock locations" / this app set as Mock Location App in Developer Options.
 */
export async function startMockLocationProvider(): Promise<void> {
  if (!isMockLocationSupported()) {
    return;
  }
  return MockLocationModule.startProvider();
}

/**
 * Stop the mock location provider and remove the test location source.
 */
export async function stopMockLocationProvider(): Promise<void> {
  if (!isMockLocationSupported()) {
    return;
  }
  return MockLocationModule.stopProvider();
}

/**
 * Push a new location to the Android mock provider.
 */
export async function setMockLocation(
  options: MockLocationOptions,
): Promise<void> {
  if (!isMockLocationSupported()) {
    return;
  }
  return MockLocationModule.setLocation(
    options.latitude,
    options.longitude,
    options.altitude ?? 0,
    options.accuracy ?? 3.0,
    options.bearing ?? 0,
    options.speed ?? 0,
  );
}

/**
 * Convenience wrapper that sets position and speed from a Coordinate + bearing.
 */
export async function pushSimulatedPosition(
  coord: Coordinate,
  bearing: number,
  speedMph: number,
): Promise<void> {
  const speedMs = speedMph / 2.23694;
  await setMockLocation({
    latitude: coord.latitude,
    longitude: coord.longitude,
    bearing,
    speed: speedMs,
    accuracy: 3.0,
  });
}
