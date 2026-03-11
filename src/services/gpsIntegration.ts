import { Linking, Platform } from 'react-native';
import { Coordinate, GpsAppConfig } from '../types';

function coord(c: Coordinate): string {
  return `${c.latitude},${c.longitude}`;
}

export const GPS_APPS: GpsAppConfig[] = [
  {
    id: 'google_maps',
    name: 'Google Maps',
    icon: '🗺️',
    color: '#4285F4',
    buildUrl: (origin, dest) =>
      `https://www.google.com/maps/dir/?api=1&origin=${coord(origin)}&destination=${coord(dest)}&travelmode=driving`,
    webFallback: (origin, dest) =>
      `https://maps.google.com/?saddr=${coord(origin)}&daddr=${coord(dest)}`,
  },
  {
    id: 'waze',
    name: 'Waze',
    icon: '🚗',
    color: '#33CCFF',
    buildUrl: (_origin, dest) =>
      `waze://?ll=${coord(dest)}&navigate=yes`,
    webFallback: (_origin, dest) =>
      `https://waze.com/ul?ll=${coord(dest)}&navigate=yes`,
  },
  {
    id: 'apple_maps',
    name: 'Apple Maps',
    icon: '🍎',
    color: '#FF2D55',
    buildUrl: (origin, dest) =>
      `maps://app?saddr=${coord(origin)}&daddr=${coord(dest)}&dirflg=d`,
    webFallback: (origin, dest) =>
      `https://maps.apple.com/?saddr=${coord(origin)}&daddr=${coord(dest)}&dirflg=d`,
  },
  {
    id: 'here_maps',
    name: 'HERE Maps',
    icon: '📍',
    color: '#00AFAA',
    buildUrl: (origin, dest) =>
      `here-route://mylocation/${dest.latitude},${dest.longitude}/drive`,
    webFallback: (origin, dest) =>
      `https://wego.here.com/directions/drive/${origin.latitude},${origin.longitude}/${dest.latitude},${dest.longitude}`,
  },
  {
    id: 'osmand',
    name: 'OsmAnd',
    icon: '🌐',
    color: '#F87326',
    buildUrl: (_origin, dest) =>
      `osmand.navigation:q=${coord(dest)}`,
    webFallback: (_origin, dest) =>
      `https://osmand.net/map/?pin=${coord(dest)}`,
  },
  {
    id: 'sygic',
    name: 'Sygic',
    icon: '🧭',
    color: '#E03E2D',
    buildUrl: (_origin, dest) =>
      `com.sygic.aura://coordinate|${dest.longitude}|${dest.latitude}|drive`,
    webFallback: (_origin, dest) =>
      `https://maps.sygic.com/#/?map=${dest.latitude},${dest.longitude},14`,
  },
  {
    id: 'maps_me',
    name: 'Maps.Me',
    icon: '🗾',
    color: '#FF6600',
    buildUrl: (_origin, dest) =>
      `mapsme://map?ll=${coord(dest)}&n=Destination`,
    webFallback: (_origin, dest) =>
      `https://maps.me/get/?ll=${coord(dest)}&n=Destination`,
  },
  {
    id: 'tomtom',
    name: 'TomTom Go',
    icon: '🔴',
    color: '#CC0000',
    buildUrl: (_origin, dest) =>
      `tomtomgo://open?destination=${coord(dest)}`,
    webFallback: (_origin, dest) =>
      `https://www.tomtom.com/maps/driving-directions/?destination=${coord(dest)}`,
  },
];

/**
 * Open a third-party GPS app to navigate to the destination.
 * Falls back to web URL if the native app is not installed.
 */
export async function openInGpsApp(
  app: GpsAppConfig,
  origin: Coordinate,
  destination: Coordinate,
): Promise<void> {
  // Apple Maps only works on iOS natively, so skip deep-link check on Android
  if (app.id === 'apple_maps' && Platform.OS !== 'ios') {
    const webUrl = app.webFallback(origin, destination);
    await Linking.openURL(webUrl);
    return;
  }

  const nativeUrl = app.buildUrl(origin, destination);
  const canOpen = await Linking.canOpenURL(nativeUrl).catch(() => false);

  if (canOpen) {
    await Linking.openURL(nativeUrl);
  } else {
    const webUrl = app.webFallback(origin, destination);
    await Linking.openURL(webUrl);
  }
}
