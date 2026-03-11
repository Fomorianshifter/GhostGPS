import { Coordinate, Route } from '../types';
import { polylineToSteps } from '../utils/locationUtils';

const OSRM_API = 'https://router.project-osrm.org/route/v1/driving';

export interface GeocodingResult {
  displayName: string;
  coordinate: Coordinate;
}

/**
 * Search for a place using OpenStreetMap Nominatim.
 */
export async function geocodeAddress(
  query: string,
): Promise<GeocodingResult[]> {
  const encoded = encodeURIComponent(query);
  const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&addressdetails=1&limit=5`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'GhostGPS/1.0 (mock-location-app)',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Geocoding failed: ${response.status}`);
  }

  const data: Array<{
    display_name: string;
    lat: string;
    lon: string;
  }> = await response.json();

  return data.map(item => ({
    displayName: item.display_name,
    coordinate: {
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    },
  }));
}

/**
 * Reverse-geocode a coordinate using Nominatim.
 */
export async function reverseGeocode(
  coordinate: Coordinate,
): Promise<string | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${coordinate.latitude}&lon=${coordinate.longitude}&format=json`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'GhostGPS/1.0 (mock-location-app)',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data: { display_name?: string } = await response.json();
    return data.display_name ?? null;
  } catch {
    return null;
  }
}

/**
 * Calculate a driving route between two coordinates using OSRM.
 */
export async function calculateRoute(
  origin: Coordinate,
  destination: Coordinate,
): Promise<Route> {
  const coords = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
  const url = `${OSRM_API}/${coords}?overview=full&geometries=geojson&steps=true`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Routing failed: ${response.status}`);
  }

  const data: {
    code: string;
    routes: Array<{
      distance: number;
      duration: number;
      geometry: {
        coordinates: Array<[number, number]>;
      };
    }>;
  } = await response.json();

  if (data.code !== 'Ok' || !data.routes.length) {
    throw new Error('No route found');
  }

  const route = data.routes[0];

  const polyline: Coordinate[] = route.geometry.coordinates.map(
    ([lon, lat]) => ({
      latitude: lat,
      longitude: lon,
    }),
  );

  const steps = polylineToSteps(polyline);

  return {
    steps,
    totalDistanceMeters: route.distance,
    totalDurationSeconds: route.duration,
    polyline,
  };
}
