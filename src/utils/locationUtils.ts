import { Coordinate, Route, RouteStep } from '../types';

const EARTH_RADIUS_METERS = 6371000;

export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Calculate the distance between two coordinates in meters using the Haversine formula.
 */
export function haversineDistance(a: Coordinate, b: Coordinate): number {
  const dLat = degreesToRadians(b.latitude - a.latitude);
  const dLon = degreesToRadians(b.longitude - a.longitude);
  const lat1 = degreesToRadians(a.latitude);
  const lat2 = degreesToRadians(b.latitude);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);

  const haversine =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  return EARTH_RADIUS_METERS * c;
}

/**
 * Calculate the initial bearing from point A to point B in degrees (0–360).
 */
export function calculateBearing(a: Coordinate, b: Coordinate): number {
  const lat1 = degreesToRadians(a.latitude);
  const lat2 = degreesToRadians(b.latitude);
  const dLon = degreesToRadians(b.longitude - a.longitude);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  const bearingRad = Math.atan2(y, x);
  return (radiansToDegrees(bearingRad) + 360) % 360;
}

/**
 * Calculate a new coordinate given a starting point, bearing, and distance.
 */
export function destinationPoint(
  origin: Coordinate,
  bearingDegrees: number,
  distanceMeters: number,
): Coordinate {
  const R = EARTH_RADIUS_METERS;
  const d = distanceMeters / R;
  const brng = degreesToRadians(bearingDegrees);
  const lat1 = degreesToRadians(origin.latitude);
  const lon1 = degreesToRadians(origin.longitude);

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) +
      Math.cos(lat1) * Math.sin(d) * Math.cos(brng),
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2),
    );

  return {
    latitude: radiansToDegrees(lat2),
    longitude: ((radiansToDegrees(lon2) + 540) % 360) - 180,
  };
}

/**
 * Convert a polyline array into RouteStep objects with distances and bearings.
 */
export function polylineToSteps(polyline: Coordinate[]): RouteStep[] {
  const steps: RouteStep[] = [];
  for (let i = 0; i < polyline.length - 1; i++) {
    const from = polyline[i];
    const to = polyline[i + 1];
    steps.push({
      coordinate: from,
      distanceMeters: haversineDistance(from, to),
      bearing: calculateBearing(from, to),
    });
  }
  if (polyline.length > 0) {
    const last = polyline[polyline.length - 1];
    steps.push({ coordinate: last, distanceMeters: 0, bearing: 0 });
  }
  return steps;
}

/**
 * Given a route and a distance traveled (meters), interpolate the current coordinate.
 */
export function interpolatePosition(
  route: Route,
  distanceTraveledMeters: number,
): { coordinate: Coordinate; bearing: number } {
  let accumulated = 0;
  const steps = route.steps;

  for (let i = 0; i < steps.length - 1; i++) {
    const step = steps[i];
    const nextAccumulated = accumulated + step.distanceMeters;

    if (distanceTraveledMeters <= nextAccumulated) {
      const fraction =
        step.distanceMeters > 0
          ? (distanceTraveledMeters - accumulated) / step.distanceMeters
          : 0;
      const coordinate = destinationPoint(
        step.coordinate,
        step.bearing,
        fraction * step.distanceMeters,
      );
      return { coordinate, bearing: step.bearing };
    }
    accumulated = nextAccumulated;
  }

  // Past end of route — return the last step coordinate
  const last = steps[steps.length - 1];
  return { coordinate: last.coordinate, bearing: last.bearing };
}

export function metersPerSecondToMph(mps: number): number {
  return mps * 2.23694;
}

export function mphToMetersPerSecond(mph: number): number {
  return mph / 2.23694;
}

export function metersToMiles(meters: number): number {
  return meters / 1609.344;
}

export function secondsToHumanReadable(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}
