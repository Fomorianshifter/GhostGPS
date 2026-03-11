import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Switch,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const SPEED_OPTIONS_MPH = [15, 25, 30, 35, 45, 55, 65, 75];
const STORAGE_KEY_SPEED = 'ghostgps_speed_mph';
const STORAGE_KEY_UNITS = 'ghostgps_units_metric';

export function SettingsScreen() {
  const navigation = useNavigation();
  const [speedMph, setSpeedMph] = useState(30);
  const [useMetric, setUseMetric] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const storedSpeed = await AsyncStorage.getItem(STORAGE_KEY_SPEED);
        const storedMetric = await AsyncStorage.getItem(STORAGE_KEY_UNITS);
        if (storedSpeed) {
          setSpeedMph(parseInt(storedSpeed, 10));
        }
        if (storedMetric) {
          setUseMetric(storedMetric === 'true');
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const handleSpeedSelect = async (mph: number) => {
    setSpeedMph(mph);
    await AsyncStorage.setItem(STORAGE_KEY_SPEED, String(mph));
  };

  const handleMetricToggle = async (value: boolean) => {
    setUseMetric(value);
    await AsyncStorage.setItem(STORAGE_KEY_UNITS, String(value));
  };

  const openDeveloperOptions = () => {
    if (Platform.OS === 'android') {
      Linking.openSettings();
    } else {
      Alert.alert(
        'iOS Note',
        'Mock locations on iOS require Xcode simulated locations or GPX files.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>{'← Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <SectionHeader title="Simulation Speed" />
        <View style={styles.card}>
          <Text style={styles.cardSubtitle}>
            Select default speed for mock location simulation:
          </Text>
          <View style={styles.speedGrid}>
            {SPEED_OPTIONS_MPH.map(mph => {
              const kmh = Math.round(mph * 1.60934);
              const label = useMetric ? `${kmh} km/h` : `${mph} mph`;
              return (
                <TouchableOpacity
                  key={mph}
                  style={[styles.speedChip, speedMph === mph && styles.speedChipActive]}
                  onPress={() => handleSpeedSelect(mph)}
                >
                  <Text
                    style={[styles.speedChipText, speedMph === mph && styles.speedChipTextActive]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <SectionHeader title="Units" />
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Use Metric (km/h)</Text>
            <Switch value={useMetric} onValueChange={handleMetricToggle} />
          </View>
        </View>

        <SectionHeader title="Android Setup" />
        <View style={styles.card}>
          <Text style={styles.cardText}>
            To inject mock GPS locations into other apps on Android, you must:
          </Text>
          <Text style={styles.step}>1. Enable Developer Options on your device.</Text>
          <Text style={styles.step}>2. Go to Developer Options → Select Mock Location App.</Text>
          <Text style={styles.step}>3. Select <Text style={styles.bold}>GhostGPS</Text> from the list.</Text>
          <Text style={styles.step}>4. Return to GhostGPS and start a simulation.</Text>
          <TouchableOpacity style={styles.actionButton} onPress={openDeveloperOptions}>
            <Text style={styles.actionButtonText}>Open Device Settings</Text>
          </TouchableOpacity>
        </View>

        <SectionHeader title="About" />
        <View style={styles.card}>
          <Text style={styles.cardText}>
            <Text style={styles.bold}>GhostGPS</Text> simulates driving at a set
            speed along a calculated route and injects it as a mock GPS location.
            You can open the route in Google Maps, Waze, Apple Maps, HERE, OsmAnd,
            Sygic, Maps.Me, or TomTom Go.
          </Text>
          <Text style={styles.cardTextSpaced}>
            Route data provided by OSRM. Geocoding by OpenStreetMap Nominatim.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  backButton: { marginRight: 12 },
  backText: { fontSize: 16, color: '#4285F4' },
  title: { fontSize: 18, fontWeight: '600', color: '#222' },
  content: { padding: 16, paddingBottom: 40 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  cardSubtitle: { fontSize: 13, color: '#666', marginBottom: 12 },
  cardText: { fontSize: 14, color: '#444', lineHeight: 20 },
  cardTextSpaced: { fontSize: 14, color: '#444', lineHeight: 20, marginTop: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: { fontSize: 15, color: '#333' },
  speedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  speedChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#d0d0d0',
    backgroundColor: '#f9f9f9',
  },
  speedChipActive: {
    borderColor: '#4285F4',
    backgroundColor: '#e8f0fe',
  },
  speedChipText: { fontSize: 14, color: '#555' },
  speedChipTextActive: { color: '#4285F4', fontWeight: '600' },
  step: { fontSize: 13, color: '#555', marginTop: 6, lineHeight: 18 },
  bold: { fontWeight: '700', color: '#222' },
  actionButton: {
    marginTop: 14,
    backgroundColor: '#4285F4',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
