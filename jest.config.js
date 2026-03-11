module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['./jest/setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-maps|react-native-screens|react-native-safe-area-context|react-native-gesture-handler|@react-native-async-storage|@react-native-community)/)',
  ],
};
