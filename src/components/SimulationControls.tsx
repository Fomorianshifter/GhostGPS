import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SimulationState } from '../types';
import { secondsToHumanReadable, metersToMiles } from '../utils/locationUtils';

interface SimulationControlsProps {
  state: SimulationState | null;
  hasRoute: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export function SimulationControls({
  state,
  hasRoute,
  onStart,
  onPause,
  onResume,
  onStop,
}: SimulationControlsProps) {
  const progressPct =
    state && state.totalDistanceMeters > 0
      ? (state.progressMeters / state.totalDistanceMeters) * 100
      : 0;

  return (
    <View style={styles.container}>
      {state && (
        <View style={styles.infoRow}>
          <InfoBadge
            label="Speed"
            value={`${state.currentSpeedMph.toFixed(0)} mph`}
          />
          <InfoBadge
            label="Distance"
            value={`${metersToMiles(state.totalDistanceMeters - state.progressMeters).toFixed(1)} mi`}
          />
          <InfoBadge
            label="ETA"
            value={secondsToHumanReadable(state.remainingSeconds)}
          />
        </View>
      )}

      {state && (
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progressPct}%` }]} />
        </View>
      )}

      <View style={styles.buttonRow}>
        {!state?.isRunning ? (
          <TouchableOpacity
            style={[styles.button, styles.startButton, !hasRoute && styles.disabled]}
            onPress={onStart}
            disabled={!hasRoute}
          >
            <Text style={styles.buttonText}>▶ Start</Text>
          </TouchableOpacity>
        ) : state.isPaused ? (
          <>
            <TouchableOpacity style={[styles.button, styles.resumeButton]} onPress={onResume}>
              <Text style={styles.buttonText}>▶ Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={onStop}>
              <Text style={styles.buttonText}>■ Stop</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={[styles.button, styles.pauseButton]} onPress={onPause}>
              <Text style={styles.buttonText}>⏸ Pause</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={onStop}>
              <Text style={styles.buttonText}>■ Stop</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

function InfoBadge({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeLabel}>{label}</Text>
      <Text style={styles.badgeValue}>{value}</Text>
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  badge: {
    alignItems: 'center',
  },
  badgeLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 2,
  },
  badgeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4285F4',
    borderRadius: 3,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButton: { backgroundColor: '#34A853' },
  pauseButton: { backgroundColor: '#FBBC05' },
  resumeButton: { backgroundColor: '#4285F4' },
  stopButton: { backgroundColor: '#EA4335' },
  disabled: { opacity: 0.4 },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
