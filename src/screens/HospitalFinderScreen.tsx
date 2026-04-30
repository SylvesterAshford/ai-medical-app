// HospitalFinderScreen — Map-based view showing nearby hospitals in Myanmar

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Linking, Platform, Dimensions, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker, Polyline, Region, PROVIDER_DEFAULT, LatLng } from 'react-native-maps';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import OfflineBanner from '../components/OfflineBanner';
import { colors, spacing, typography, borderRadius, gradients, shadows } from '../theme';
import { getHospitalsWithFallback, getGoogleMapsDirectionsUrl } from '../services/hospitals';
import { MYANMAR_EMERGENCY_NUMBER } from '../utils/triageRules';
import { useAppStore } from '../store/useAppStore';
import { Hospital, RootStackParamList } from '../types';
import { trackEvent } from '../services/analytics';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type HospitalFinderRouteProp = RouteProp<RootStackParamList, 'HospitalFinder'>;

// Myanmar geographic bounds — restrict map to Myanmar only
const MYANMAR_BOUNDS = {
  north: 28.5,   // Northernmost point
  south: 9.5,    // Southernmost point (Kawthoung)
  east: 101.2,   // Easternmost point
  west: 92.0,    // Westernmost point (Chin State)
};

// Default center — Mandalay
const MYANMAR_CENTER = {
  latitude: 21.9588,
  longitude: 96.0891,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

export default function HospitalFinderScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<HospitalFinderRouteProp>();
  const isEmergency = route.params?.emergency ?? false;
  const language = useAppStore(s => s.language);

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeDistance, setRouteDistance] = useState<string | null>(null);
  const [routeDuration, setRouteDuration] = useState<string | null>(null);

  const mapRef = useRef<MapView>(null);
  const bottomSheetAnim = useRef(new Animated.Value(0)).current;

  const fetchNearby = useCallback(async () => {
    setLoading(true);
    // Mandalay fallback coordinates
    const fallbackLat = 21.9588;
    const fallbackLon = 96.0891;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      let lat = fallbackLat;
      let lon = fallbackLon;

      if (status === 'granted') {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          lat = location.coords.latitude;
          lon = location.coords.longitude;
        } catch {
          // GPS failed — use fallback
        }
      }

      setUserLocation({ lat, lon });

      const result = await getHospitalsWithFallback(lat, lon, 50);
      setHospitals(result.hospitals);
      setLocationError(null);

      trackEvent('hospital_map_loaded', { count: result.hospitals.length });
    } catch {
      // Even on total failure, try to load from Mandalay
      setUserLocation({ lat: fallbackLat, lon: fallbackLon });
      try {
        const result = await getHospitalsWithFallback(fallbackLat, fallbackLon, 50);
        setHospitals(result.hospitals);
      } catch {
        setLocationError(language === 'my'
          ? 'ဆေးရုံများ ရယူ၍ မရပါ'
          : 'Could not load hospitals');
      }
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchNearby();
  }, [fetchNearby]);

  // Animate to user location when we have it
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.lat,
        longitude: userLocation.lon,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
      }, 800);
    }
  }, [userLocation]);

  const handleCallEmergency = () => {
    const phoneUrl = Platform.OS === 'ios'
      ? `telprompt:${MYANMAR_EMERGENCY_NUMBER}`
      : `tel:${MYANMAR_EMERGENCY_NUMBER}`;
    Linking.openURL(phoneUrl).catch(() => {});
  };

  const handleSelectHospital = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    Animated.spring(bottomSheetAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();

    // Center map on selected hospital
    mapRef.current?.animateToRegion({
      latitude: hospital.latitude,
      longitude: hospital.longitude,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    }, 500);
  };

  const handleDismissSheet = () => {
    Animated.timing(bottomSheetAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setSelectedHospital(null);
      handleClearRoute();
    });
  };

  const handleGetDirections = async (hospital: Hospital) => {
    if (!userLocation) return;

    setRouteLoading(true);
    trackEvent('hospital_directions_opened', { hospital: hospital.name });

    try {
      // Fetch route from OSRM (free, no API key needed)
      const url = `https://router.project-osrm.org/route/v1/driving/${userLocation.lon},${userLocation.lat};${hospital.longitude},${hospital.latitude}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coords: LatLng[] = route.geometry.coordinates.map(
          (coord: [number, number]) => ({
            latitude: coord[1],
            longitude: coord[0],
          })
        );
        setRouteCoords(coords);

        // Distance and duration
        const distKm = (route.distance / 1000).toFixed(1);
        const durMin = Math.round(route.duration / 60);
        setRouteDistance(`${distKm} km`);
        setRouteDuration(durMin >= 60 ? `${Math.floor(durMin / 60)}h ${durMin % 60}m` : `${durMin} min`);

        // Fit map to show the full route
        if (mapRef.current && coords.length > 0) {
          mapRef.current.fitToCoordinates(
            [
              { latitude: userLocation.lat, longitude: userLocation.lon },
              { latitude: hospital.latitude, longitude: hospital.longitude },
              ...coords,
            ],
            {
              edgePadding: { top: 80, right: 60, bottom: 280, left: 60 },
              animated: true,
            }
          );
        }
      }
    } catch {
      // Fallback: open Google Maps if OSRM fails
      const gmapsUrl = getGoogleMapsDirectionsUrl(hospital.latitude, hospital.longitude, hospital.name);
      Linking.openURL(gmapsUrl).catch(() => {});
    } finally {
      setRouteLoading(false);
    }
  };

  const handleClearRoute = () => {
    setRouteCoords([]);
    setRouteDistance(null);
    setRouteDuration(null);
  };

  const handleCenterOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.lat,
        longitude: userLocation.lon,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
      }, 500);
    }
  };

  // Clamp map to Myanmar bounds
  const handleRegionChangeComplete = (region: Region) => {
    const clampedLat = Math.min(Math.max(region.latitude, MYANMAR_BOUNDS.south), MYANMAR_BOUNDS.north);
    const clampedLon = Math.min(Math.max(region.longitude, MYANMAR_BOUNDS.west), MYANMAR_BOUNDS.east);

    if (clampedLat !== region.latitude || clampedLon !== region.longitude) {
      mapRef.current?.animateToRegion({
        latitude: clampedLat,
        longitude: clampedLon,
        latitudeDelta: region.latitudeDelta,
        longitudeDelta: region.longitudeDelta,
      }, 300);
    }
  };

  const bottomSheetTranslateY = bottomSheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[...gradients.header] as [string, string, ...string[]]}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {isEmergency
                ? (language === 'my' ? 'အရေးပေါ် ဆေးရုံရှာဖွေမှု' : 'Emergency Hospital Search')
                : (language === 'my' ? 'အနီးဆုံး ဆေးရုံများ' : 'Nearby Hospitals')}
            </Text>
            {!loading && hospitals.length > 0 && (
              <Text style={styles.headerSubtitle}>
                {hospitals.length} {language === 'my' ? 'ဆေးရုံ တွေ့ရှိပါသည်' : `hospital${hospitals.length === 1 ? '' : 's'} found`}
              </Text>
            )}
          </View>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <OfflineBanner />

      {/* Emergency Banner */}
      {isEmergency && (
        <TouchableOpacity
          onPress={handleCallEmergency}
          activeOpacity={0.8}
          style={styles.emergencyBanner}
        >
          <LinearGradient
            colors={['#D4A843', '#C4963A'] as [string, string, ...string[]]}
            style={styles.emergencyBannerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="call" size={22} color={colors.white} />
            <View>
              <Text style={styles.emergencyBannerText}>
                Call {MYANMAR_EMERGENCY_NUMBER} (Ambulance)
              </Text>
              <Text style={styles.emergencyBannerSub}>
                အရေးပေါ် လူနာတင်ယာဉ် ခေါ်ရန် နှိပ်ပါ
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Map or Loading */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.teal} />
          <Text style={styles.loadingText}>
            {language === 'my' ? 'တည်နေရာ ရှာဖွေနေပါသည်...' : 'Finding your location...'}
          </Text>
        </View>
      ) : locationError ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="location-outline" size={48} color={colors.textLight} />
          <Text style={styles.loadingText}>{locationError}</Text>
          <TouchableOpacity onPress={() => fetchNearby()} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>
              {language === 'my' ? 'ပြန်ကြိုးစားပါ' : 'Retry'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_DEFAULT}
            initialRegion={
              userLocation
                ? {
                    latitude: userLocation.lat,
                    longitude: userLocation.lon,
                    latitudeDelta: 0.15,
                    longitudeDelta: 0.15,
                  }
                : MYANMAR_CENTER
            }
            showsUserLocation
            showsMyLocationButton={false}
            showsCompass
            minZoomLevel={5}
            maxZoomLevel={18}
            onRegionChangeComplete={handleRegionChangeComplete}
            onPress={() => {
              if (selectedHospital) handleDismissSheet();
            }}
            mapPadding={{ top: 0, right: 0, bottom: selectedHospital ? 200 : 0, left: 0 }}
          >
            {/* Hospital markers */}
            {hospitals.map((hospital) => {
              const isSelected = selectedHospital?.id === hospital.id;
              return (
                <Marker
                  key={hospital.id}
                  coordinate={{
                    latitude: hospital.latitude,
                    longitude: hospital.longitude,
                  }}
                  title={hospital.name}
                  description={hospital.distance ? `${hospital.distance} km` : undefined}
                  onPress={() => handleSelectHospital(hospital)}
                  tracksViewChanges={false}
                >
                  <View style={styles.markerWrapper}>
                    {isSelected && <View style={styles.markerPulse} />}
                    <View style={[
                      styles.markerContainer,
                      isSelected && styles.markerContainerSelected,
                    ]}>
                      <Ionicons
                        name="medkit"
                        size={isSelected ? 18 : 14}
                        color={colors.white}
                      />
                    </View>
                    <View style={[
                      styles.markerPointer,
                      isSelected && styles.markerPointerSelected,
                    ]} />
                  </View>
                </Marker>
              );
            })}

            {/* Route polyline — shadow layer for depth */}
            {routeCoords.length > 0 && (
              <Polyline
                coordinates={routeCoords}
                strokeColor="rgba(0,0,0,0.15)"
                strokeWidth={8}
                lineJoin="round"
                lineCap="round"
                geodesic
              />
            )}
            {/* Route polyline — main line */}
            {routeCoords.length > 0 && (
              <Polyline
                coordinates={routeCoords}
                strokeColor={colors.teal}
                strokeWidth={5}
                lineJoin="round"
                lineCap="round"
                geodesic
              />
            )}
          </MapView>

          {/* Center on user button */}
          {userLocation && (
            <TouchableOpacity
              style={styles.centerBtn}
              onPress={handleCenterOnUser}
              activeOpacity={0.8}
            >
              <Ionicons name="locate" size={22} color={colors.teal} />
            </TouchableOpacity>
          )}

          {/* Refresh button */}
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={() => fetchNearby()}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={22} color={colors.teal} />
          </TouchableOpacity>

          {/* Selected hospital bottom sheet */}
          {selectedHospital && (
            <Animated.View
              style={[
                styles.bottomSheet,
                { transform: [{ translateY: bottomSheetTranslateY }] },
              ]}
            >
              <View style={styles.sheetHandle} />
              <View style={styles.sheetContent}>
                <View style={styles.sheetHeader}>
                  <View style={styles.sheetIconCircle}>
                    <Ionicons name="medical" size={22} color={colors.white} />
                  </View>
                  <View style={styles.sheetInfo}>
                    <Text style={styles.sheetName} numberOfLines={2}>
                      {selectedHospital.name}
                    </Text>
                    <Text style={styles.sheetCity}>
                      {selectedHospital.city}
                      {selectedHospital.distance
                        ? ` • ${selectedHospital.distance} km`
                        : ''}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleDismissSheet}
                    style={styles.sheetCloseBtn}
                  >
                    <Ionicons name="close" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Details row */}
                <View style={styles.sheetDetailsRow}>
                  {selectedHospital.type && (
                    <View style={styles.sheetTag}>
                      <Ionicons name="business" size={12} color={colors.teal} />
                      <Text style={styles.sheetTagText}>{selectedHospital.type}</Text>
                    </View>
                  )}
                  {selectedHospital.emergency_24hr && (
                    <View style={[styles.sheetTag, styles.sheetTagEmergency]}>
                      <Ionicons name="time" size={12} color="#856404" />
                      <Text style={[styles.sheetTagText, { color: '#856404' }]}>24h ER</Text>
                    </View>
                  )}
                </View>

                {/* Route info bar */}
                {routeCoords.length > 0 && routeDistance && routeDuration && (
                  <View style={styles.routeInfoBar}>
                    <View style={styles.routeInfoItem}>
                      <Ionicons name="car" size={16} color={colors.teal} />
                      <Text style={styles.routeInfoText}>{routeDistance}</Text>
                    </View>
                    <View style={styles.routeInfoDivider} />
                    <View style={styles.routeInfoItem}>
                      <Ionicons name="time" size={16} color={colors.teal} />
                      <Text style={styles.routeInfoText}>{routeDuration}</Text>
                    </View>
                  </View>
                )}

                {/* Action buttons */}
                <View style={styles.sheetActions}>
                  {/* Primary action — full width */}
                  {routeCoords.length > 0 ? (
                    <TouchableOpacity
                      style={styles.directionsBtn}
                      onPress={() => {
                        const url = getGoogleMapsDirectionsUrl(
                          selectedHospital.latitude,
                          selectedHospital.longitude,
                          selectedHospital.name,
                        );
                        Linking.openURL(url).catch(() => {});
                      }}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[...gradients.teal] as [string, string, ...string[]]}
                        style={styles.directionsBtnGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Ionicons name="open-outline" size={18} color={colors.white} />
                        <Text style={styles.directionsBtnText} numberOfLines={1}>
                          {language === 'my' ? 'Google Maps ဖွင့်ရန်' : 'Open in Google Maps'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.directionsBtn}
                      onPress={() => handleGetDirections(selectedHospital)}
                      activeOpacity={0.8}
                      disabled={routeLoading}
                    >
                      <LinearGradient
                        colors={[...gradients.teal] as [string, string, ...string[]]}
                        style={[styles.directionsBtnGradient, routeLoading && { opacity: 0.6 }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        {routeLoading ? (
                          <ActivityIndicator size="small" color={colors.white} />
                        ) : (
                          <Ionicons name="navigate" size={18} color={colors.white} />
                        )}
                        <Text style={styles.directionsBtnText} numberOfLines={1}>
                          {routeLoading
                            ? (language === 'my' ? 'ရှာဖွေနေသည်...' : 'Loading...')
                            : (language === 'my' ? 'လမ်းညွှန်ပြရန်' : 'Get Directions')}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}

                  {/* Secondary row — Clear + Call side by side */}
                  <View style={styles.secondaryActions}>
                    {routeCoords.length > 0 && (
                      <TouchableOpacity
                        style={styles.clearRouteBtn}
                        onPress={handleClearRoute}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="close-circle-outline" size={18} color={colors.textSecondary} />
                        <Text style={styles.clearRouteBtnText} numberOfLines={1}>
                          {language === 'my' ? 'လမ်းကြောင်းဖျက်ရန်' : 'Clear Route'}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {selectedHospital.phone && (
                      <TouchableOpacity
                        style={styles.callBtn}
                        onPress={() => {
                          const phoneUrl = Platform.OS === 'ios'
                            ? `telprompt:${selectedHospital.phone}`
                            : `tel:${selectedHospital.phone}`;
                          Linking.openURL(phoneUrl).catch(() => {});
                        }}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="call" size={18} color={colors.teal} />
                        <Text style={styles.callBtnText} numberOfLines={1}>
                          {language === 'my' ? 'ဖုန်းခေါ်ရန်' : 'Call Hospital'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </Animated.View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },

  // Header
  header: {
    paddingTop: 56,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.text,
    lineHeight: 34,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 28,
  },

  // Emergency
  emergencyBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.button,
    shadowColor: '#D4A843',
  },
  emergencyBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    gap: spacing.lg,
  },
  emergencyBannerText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
    lineHeight: 26,
  },
  emergencyBannerSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 1,
    lineHeight: 26,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    backgroundColor: '#E8F8F8',
    borderRadius: borderRadius.xl,
    marginTop: spacing.md,
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.teal,
  },

  // Map
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },

  // Floating buttons
  centerBtn: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
    shadowOpacity: 0.15,
  },
  refreshBtn: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
    shadowOpacity: 0.15,
  },

  // Bottom sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    ...shadows.card,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 20,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  sheetContent: {
    paddingHorizontal: spacing.xl,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheetIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  sheetInfo: {
    flex: 1,
  },
  sheetName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    lineHeight: 28,
  },
  sheetCity: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 28,
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },

  // Tags
  sheetDetailsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  sheetTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: '#E8F8F8',
    borderRadius: borderRadius.xl,
  },
  sheetTagEmergency: {
    backgroundColor: '#FFF9E6',
  },
  sheetTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.teal,
    lineHeight: 28,
  },

  // Sheet actions — vertical stack layout
  sheetActions: {
    flexDirection: 'column',
    width: '100%',
    gap: spacing.sm,
  },
  directionsBtn: {
    width: '100%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  directionsBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    width: '100%',
  },
  directionsBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
    lineHeight: 26,
  },
  secondaryActions: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.sm,
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    backgroundColor: '#E8F8F8',
    borderRadius: borderRadius.lg,
  },
  callBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.teal,
    lineHeight: 28,
  },

  // Route info
  routeInfoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F8F8',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.lg,
  },
  routeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeInfoText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.teal,
  },
  routeInfoDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.teal + '40',
  },
  clearRouteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    backgroundColor: '#F3F4F6',
    borderRadius: borderRadius.lg,
  },
  clearRouteBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    lineHeight: 26,
  },

  // Custom map markers
  markerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 70,
  },
  markerPulse: {
    position: 'absolute',
    top: 0,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.teal + '20',
    borderWidth: 2,
    borderColor: colors.teal + '40',
  },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  markerContainerSelected: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E17055',
    borderWidth: 3,
    borderColor: colors.white,
  },
  markerPointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.teal,
    marginTop: -2,
  },
  markerPointerSelected: {
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderTopColor: '#E17055',
  },
});
