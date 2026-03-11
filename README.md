# GhostGPS

A React Native GPS simulation app that lets you set a mock location and simulates driving to a destination at the speed limit. Works as an Android **Mock Location Provider**, injecting fake GPS coordinates into the system so every other app on the device sees the simulated position.

---

## Features

| Feature | Details |
|---|---|
| 🗺️ Map view | Google Maps (Android) / Apple Maps (iOS) via `react-native-maps` |
| 📍 Destination search | Free geocoding via OpenStreetMap Nominatim |
| 🔀 Route calculation | Free routing via OSRM (Open Source Routing Machine) |
| 🚗 Mock location injection | Android `LocationManager` test provider |
| ⏱️ Speed simulation | User-configurable speed (mph / km/h); drives along the calculated route |
| ⏸ Playback controls | Start / Pause / Resume / Stop |
| 📲 GPS app integration | One-tap hand-off to **Google Maps, Waze, Apple Maps, HERE Maps, OsmAnd, Sygic, Maps.Me, TomTom Go** |
| ⚙️ Settings screen | Speed presets, metric/imperial toggle, Android setup guide |

---

## Requirements

- **Node.js** ≥ 22
- **Android Studio** (for Android builds) + Android SDK API 33+
- **Xcode** 15+ (for iOS builds)
- A **Google Maps API key** (for the Android map tiles – the simulation logic works without one)

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. For Android – add your Google Maps API key to:
#    android/app/src/main/res/values/strings.xml
#    <string name="google_maps_key">YOUR_API_KEY_HERE</string>

# 3. Run on Android
npx react-native run-android

# 4. Run on iOS
cd ios && pod install && cd ..
npx react-native run-ios
```

---

## Android Mock Location Setup

GhostGPS needs to be registered as the device's **Mock Location App**:

1. Enable **Developer Options** (Settings → About Phone → tap "Build Number" 7 times).
2. Go to **Settings → Developer Options → Select Mock Location App**.
3. Choose **GhostGPS** from the list.
4. Open GhostGPS, search for a destination, and press **Start**.

All apps that read GPS (Google Maps, Waze, Pokémon GO, etc.) will now see the simulated position.

---

## Supported GPS App Integrations

| App | Platform | Integration |
|---|---|---|
| Google Maps | Android / iOS / Web | Deep link + web fallback |
| Waze | Android / iOS / Web | Deep link + web fallback |
| Apple Maps | iOS | Deep link |
| HERE Maps | Android / iOS / Web | Deep link + web fallback |
| OsmAnd | Android | Deep link + web fallback |
| Sygic | Android / iOS | Deep link + web fallback |
| Maps.Me | Android / iOS | Deep link + web fallback |
| TomTom Go | Android / iOS | Deep link + web fallback |

---

## Project Structure

```
src/
  components/
    SearchBar.tsx         – Debounced Nominatim geocoding search
    SimulationControls.tsx – Start/Pause/Resume/Stop + progress bar
    GpsAppButtons.tsx     – Horizontal scroll of GPS app buttons
  screens/
    HomeScreen.tsx        – Main map screen
    SettingsScreen.tsx    – Speed, units, setup instructions
  services/
    routing.ts            – Nominatim geocoding + OSRM route calculation
    mockLocation.ts       – JS wrapper for Android MockLocationModule
    gpsIntegration.ts     – Deep-link builder for 8 GPS apps
  utils/
    locationUtils.ts      – Haversine, bearing, interpolation, conversions
    routeSimulator.ts     – useRouteSimulator React hook (tick-based simulation)
  types/
    index.ts              – Shared TypeScript types
android/
  app/src/main/java/com/ghostgps/
    MockLocationModule.kt  – Native Kotlin module (LocationManager test provider)
    MockLocationPackage.kt – ReactPackage registration
```

---

## Running Tests

```bash
npm test
```

32 tests covering the location math utilities and GPS app URL generators.

---

## Attributions

- Route data: [OSRM](https://project-osrm.org/) (Open Source Routing Machine)
- Geocoding: [OpenStreetMap Nominatim](https://nominatim.org/)
- Map tiles: Google Maps (Android), Apple Maps (iOS)
