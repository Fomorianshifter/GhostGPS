package com.ghostgps

import android.location.Location
import android.location.LocationManager
import android.os.Build
import android.os.SystemClock
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * MockLocationModule provides Android mock GPS location functionality.
 *
 * Requirements:
 *  - The device must have Developer Options enabled.
 *  - This app must be selected as the "Mock Location App" in Developer Options.
 *
 * Usage from JS:
 *   NativeModules.MockLocationModule.startProvider()
 *   NativeModules.MockLocationModule.setLocation(lat, lon, alt, accuracy, bearing, speed)
 *   NativeModules.MockLocationModule.stopProvider()
 */
class MockLocationModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val PROVIDER_NAME = LocationManager.GPS_PROVIDER
    }

    private val locationManager: LocationManager
        get() = reactApplicationContext.getSystemService(android.content.Context.LOCATION_SERVICE)
                as LocationManager

    override fun getName(): String = "MockLocationModule"

    @ReactMethod
    fun startProvider(promise: Promise) {
        try {
            val lm = locationManager
            // Remove existing test provider if already added
            try {
                lm.removeTestProvider(PROVIDER_NAME)
            } catch (_: IllegalArgumentException) {
                // Not added yet — that's fine
            }
            lm.addTestProvider(
                PROVIDER_NAME,
                false, // requiresNetwork
                false, // requiresSatellite
                false, // requiresCell
                false, // hasMonetaryCost
                true,  // supportsAltitude
                true,  // supportsSpeed
                true,  // supportsBearing
                android.location.provider.ProviderProperties.POWER_USAGE_LOW,
                android.location.provider.ProviderProperties.ACCURACY_FINE,
            )
            lm.setTestProviderEnabled(PROVIDER_NAME, true)
            promise.resolve(null)
        } catch (e: SecurityException) {
            promise.reject(
                "PERMISSION_DENIED",
                "Mock locations not allowed. Please set GhostGPS as the Mock Location App in Developer Options.",
                e,
            )
        } catch (e: Exception) {
            promise.reject("START_FAILED", e.message, e)
        }
    }

    @ReactMethod
    fun stopProvider(promise: Promise) {
        try {
            val lm = locationManager
            try {
                lm.setTestProviderEnabled(PROVIDER_NAME, false)
                lm.removeTestProvider(PROVIDER_NAME)
            } catch (_: IllegalArgumentException) {
                // Provider was not registered
            }
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("STOP_FAILED", e.message, e)
        }
    }

    /**
     * Push a new mock location to the system.
     *
     * @param latitude   Decimal degrees
     * @param longitude  Decimal degrees
     * @param altitude   Meters above sea level
     * @param accuracy   Horizontal accuracy in meters
     * @param bearing    Degrees from north (0–360)
     * @param speed      Speed in meters per second
     */
    @ReactMethod
    fun setLocation(
        latitude: Double,
        longitude: Double,
        altitude: Double,
        accuracy: Double,
        bearing: Double,
        speed: Double,
        promise: Promise,
    ) {
        try {
            val location = Location(PROVIDER_NAME).apply {
                this.latitude = latitude
                this.longitude = longitude
                this.altitude = altitude
                this.accuracy = accuracy.toFloat()
                this.bearing = bearing.toFloat()
                this.speed = speed.toFloat()
                this.time = System.currentTimeMillis()
                this.elapsedRealtimeNanos = SystemClock.elapsedRealtimeNanos()
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    this.bearingAccuracyDegrees = 1.0f
                    this.speedAccuracyMetersPerSecond = 0.5f
                    this.verticalAccuracyMeters = 5.0f
                }
                isMock = true
            }
            locationManager.setTestProviderLocation(PROVIDER_NAME, location)
            promise.resolve(null)
        } catch (e: SecurityException) {
            promise.reject(
                "PERMISSION_DENIED",
                "Mock location provider not started or not permitted.",
                e,
            )
        } catch (e: Exception) {
            promise.reject("SET_LOCATION_FAILED", e.message, e)
        }
    }
}
