import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { GPS_APPS, openInGpsApp } from '../services/gpsIntegration';
import { Coordinate } from '../types';

interface GpsAppButtonsProps {
  origin: Coordinate;
  destination: Coordinate | null;
}

export function GpsAppButtons({ origin, destination }: GpsAppButtonsProps) {
  const handlePress = async (appId: string) => {
    if (!destination) {
      Alert.alert('No Destination', 'Please select a destination first.');
      return;
    }
    const app = GPS_APPS.find(a => a.id === appId);
    if (!app) {
      return;
    }
    try {
      await openInGpsApp(app, origin, destination);
    } catch {
      Alert.alert('Error', `Could not open ${app.name}.`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Open in GPS App</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {GPS_APPS.map(app => (
          <TouchableOpacity
            key={app.id}
            style={[styles.appButton, { borderColor: app.color }, !destination && styles.disabled]}
            onPress={() => handlePress(app.id)}
            disabled={!destination}
          >
            <Text style={styles.appIcon}>{app.icon}</Text>
            <Text style={[styles.appName, { color: app.color }]}>{app.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  heading: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 10,
  },
  scroll: {
    gap: 8,
    paddingRight: 4,
  },
  appButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    minWidth: 78,
  },
  appIcon: {
    fontSize: 22,
    marginBottom: 3,
  },
  appName: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});
