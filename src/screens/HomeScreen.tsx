import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { Marker, Polyline, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SearchBar } from '../components/SearchBar';
import { SimulationControls } from '../components/SimulationControls';
import { GpsAppButtons } from '../components/GpsAppButtons';
import { GeocodingResult, calculateRoute } from '../services/routing';
import { useRouteSimulator } from '../utils/routeSimulator';
import { Coordinate, Route, SimulationState, RootStackParamList } from '../types';

const DEFAULT_REGION: Region = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const DEFAULT_SPEED_MPH = 30;

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();

  const [origin, setOrigin] = useState<Coordinate>({
    latitude: DEFAULT_REGION.latitude,
    longitude: DEFAULT_REGION.longitude,
  });
  const [destination, setDestination] = useState<Coordinate | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const [loading, setLoading] = useState(false);
  const [speedMph] = useState(DEFAULT_SPEED_MPH);

  const mapRef = useRef<MapView>(null);

  const handleSimComplete = useCallback(() => {
    Alert.alert('Arrived!', 'You have reached your destination.');
    setSimulationState(null);
  }, []);

  const { start, stop, pause, resume } = useRouteSimulator({
    route,
    speedSettings: { speedMph, useSpeedLimit: false },
    onStateChange: setSimulationState,
    onComplete: handleSimComplete,
  });

  const handleDestinationSelect = useCallback(
    async (result: GeocodingResult) => {
      const dest = result.coordinate;
      setDestination(dest);
      setLoading(true);
      try {
        const r = await calculateRoute(origin, dest);
        setRoute(r);
        // Fit map to show the whole route
        const coords = r.polyline;
        if (coords.length > 0 && mapRef.current) {
          mapRef.current.fitToCoordinates(coords, {
            edgePadding: { top: 80, right: 40, bottom: 260, left: 40 },
            animated: true,
          });
        }
      } catch {
        Alert.alert('Routing Error', 'Could not calculate route. Please try again.');
        setRoute(null);
      } finally {
        setLoading(false);
      }
    },
    [origin],
  );

  const handleMapLongPress = useCallback(
    (event: { nativeEvent: { coordinate: Coordinate } }) => {
      const coord = event.nativeEvent.coordinate;
      // Set origin by long-pressing (allows user to reposition start)
      Alert.alert(
        'Set Start Position',
        'Move your mock start location here?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes',
            onPress: async () => {
              setOrigin(coord);
              setRoute(null);
              setSimulationState(null);
              await stop();
            },
          },
        ],
      );
    },
    [stop],
  );

  const currentDisplayPosition =
    simulationState?.currentPosition ?? origin;

  return (
    <SafeAreaView style={styles.safeArea}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={DEFAULT_REGION}
        showsUserLocation={false}
        onLongPress={handleMapLongPress}
      >
        {/* Mock position marker */}
        <Marker
          coordinate={currentDisplayPosition}
          title="Mock Position"
          pinColor="#4285F4"
        />

        {/* Destination marker */}
        {destination && (
          <Marker
            coordinate={destination}
            title="Destination"
            pinColor="#EA4335"
          />
        )}

        {/* Route polyline */}
        {route && (
          <Polyline
            coordinates={route.polyline}
            strokeColor="#4285F4"
            strokeWidth={4}
          />
        )}
      </MapView>

      {/* Top overlay: search + settings */}
      <View style={styles.topOverlay}>
        <View style={styles.topRow}>
          <View style={styles.searchContainer}>
            <SearchBar onSelect={handleDestinationSelect} />
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#4285F4" />
            <Text style={styles.loadingText}>Calculating route…</Text>
          </View>
        )}
      </View>

      {/* Bottom overlay: controls + GPS app buttons */}
      <View style={styles.bottomOverlay}>
        <SimulationControls
          state={simulationState}
          hasRoute={!!route}
          onStart={() => start(origin)}
          onPause={pause}
          onResume={resume}
          onStop={async () => { await stop(); setSimulationState(null); }}
        />
        <View style={styles.spacer} />
        <GpsAppButtons origin={currentDisplayPosition} destination={destination} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  map: { ...StyleSheet.absoluteFillObject },
  topOverlay: {
    position: 'absolute',
    top: 16,
    left: 12,
    right: 12,
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  searchContainer: { flex: 1 },
  settingsButton: {
    width: 44,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  settingsIcon: { fontSize: 22 },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffffcc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  loadingText: { color: '#333', fontSize: 13 },
  bottomOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 12,
    right: 12,
    zIndex: 10,
  },
  spacer: { height: 10 },
});
