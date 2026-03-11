import { useRef, useCallback, useEffect } from 'react';
import {
  Coordinate,
  Route,
  SimulationState,
  SpeedSettings,
} from '../types';
import {
  interpolatePosition,
  mphToMetersPerSecond,
} from '../utils/locationUtils';
import {
  startMockLocationProvider,
  stopMockLocationProvider,
  pushSimulatedPosition,
} from '../services/mockLocation';

const TICK_INTERVAL_MS = 1000;

interface UseRouteSimulatorOptions {
  route: Route | null;
  speedSettings: SpeedSettings;
  onStateChange: (state: SimulationState) => void;
  onComplete: () => void;
}

export function useRouteSimulator({
  route,
  speedSettings,
  onStateChange,
  onComplete,
}: UseRouteSimulatorOptions) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef<SimulationState | null>(null);
  const routeRef = useRef<Route | null>(route);
  const speedRef = useRef<SpeedSettings>(speedSettings);

  // Keep refs in sync with latest props
  useEffect(() => {
    routeRef.current = route;
  }, [route]);

  useEffect(() => {
    speedRef.current = speedSettings;
  }, [speedSettings]);

  const stop = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    stateRef.current = null;
    await stopMockLocationProvider();
  }, []);

  const start = useCallback(
    async (startCoord: Coordinate) => {
      const currentRoute = routeRef.current;
      if (!currentRoute) {
        return;
      }

      await stop();
      await startMockLocationProvider();

      const initialState: SimulationState = {
        isRunning: true,
        isPaused: false,
        currentPosition: startCoord,
        currentBearing: 0,
        currentSpeedMph: speedRef.current.speedMph,
        progressMeters: 0,
        totalDistanceMeters: currentRoute.totalDistanceMeters,
        elapsedSeconds: 0,
        remainingSeconds: currentRoute.totalDistanceMeters /
          mphToMetersPerSecond(speedRef.current.speedMph),
      };

      stateRef.current = initialState;
      onStateChange(initialState);

      timerRef.current = setInterval(async () => {
        const prev = stateRef.current;
        const r = routeRef.current;
        if (!prev || !r || prev.isPaused) {
          return;
        }

        const speedMph = speedRef.current.speedMph;
        const speedMps = mphToMetersPerSecond(speedMph);
        const distanceDelta = speedMps * (TICK_INTERVAL_MS / 1000);
        const newProgress = Math.min(
          prev.progressMeters + distanceDelta,
          r.totalDistanceMeters,
        );

        const { coordinate, bearing } = interpolatePosition(r, newProgress);
        const elapsedSeconds = prev.elapsedSeconds + TICK_INTERVAL_MS / 1000;
        const remainingMeters = r.totalDistanceMeters - newProgress;
        const remainingSeconds =
          speedMps > 0 ? remainingMeters / speedMps : 0;

        const newState: SimulationState = {
          ...prev,
          currentPosition: coordinate,
          currentBearing: bearing,
          currentSpeedMph: speedMph,
          progressMeters: newProgress,
          elapsedSeconds,
          remainingSeconds,
        };

        stateRef.current = newState;
        onStateChange(newState);

        await pushSimulatedPosition(coordinate, bearing, speedMph);

        if (newProgress >= r.totalDistanceMeters) {
          await stop();
          onComplete();
        }
      }, TICK_INTERVAL_MS);
    },
    [stop, onStateChange, onComplete],
  );

  const pause = useCallback(() => {
    if (stateRef.current) {
      stateRef.current = { ...stateRef.current, isPaused: true };
      onStateChange(stateRef.current);
    }
  }, [onStateChange]);

  const resume = useCallback(() => {
    if (stateRef.current) {
      stateRef.current = { ...stateRef.current, isPaused: false };
      onStateChange(stateRef.current);
    }
  }, [onStateChange]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Fire-and-forget: best-effort cleanup; native provider will also be
      // cleaned up when the app process exits.
      stopMockLocationProvider().catch(() => {});
    };
  }, []);

  return { start, stop, pause, resume };
}
