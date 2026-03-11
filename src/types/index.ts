export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface RouteStep {
  coordinate: Coordinate;
  distanceMeters: number;
  bearing: number;
}

export interface Route {
  steps: RouteStep[];
  totalDistanceMeters: number;
  totalDurationSeconds: number;
  polyline: Coordinate[];
}

export interface SpeedSettings {
  speedMph: number;
  useSpeedLimit: boolean;
}

export interface SimulationState {
  isRunning: boolean;
  isPaused: boolean;
  currentPosition: Coordinate;
  currentBearing: number;
  currentSpeedMph: number;
  progressMeters: number;
  totalDistanceMeters: number;
  elapsedSeconds: number;
  remainingSeconds: number;
}

export interface GpsAppConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  buildUrl: (origin: Coordinate, destination: Coordinate) => string;
  webFallback: (origin: Coordinate, destination: Coordinate) => string;
}

export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
};
