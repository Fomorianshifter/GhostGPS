/**
 * Jest setup: mock native modules that require a real device / simulator.
 */

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MapView = React.forwardRef((props: object, ref: unknown) =>
    React.createElement(View, { testID: 'map-view', ...props, ref }),
  );
  const Marker = (props: object) => React.createElement(View, { testID: 'marker', ...props });
  const Polyline = (props: object) => React.createElement(View, { testID: 'polyline', ...props });

  return {
    __esModule: true,
    default: MapView,
    Marker,
    Polyline,
    PROVIDER_GOOGLE: 'google',
  };
});

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock @react-native-community/geolocation
jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
  stopObserving: jest.fn(),
  requestAuthorization: jest.fn(),
}));

// Mock the MockLocationModule native module
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.NativeModules.MockLocationModule = {
    startProvider: jest.fn(() => Promise.resolve()),
    stopProvider: jest.fn(() => Promise.resolve()),
    setLocation: jest.fn(() => Promise.resolve()),
  };
  return RN;
});
