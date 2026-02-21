// HospitalFinderScreen — GPS location + nearby hospital list

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Linking, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import GradientBackground from '../components/GradientBackground';
import HospitalCard from '../components/HospitalCard';
import OfflineBanner from '../components/OfflineBanner';
import { colors, spacing, typography, borderRadius, gradients, shadows } from '../theme';
import { getHospitalsWithFallback } from '../services/hospitals';
import { MYANMAR_EMERGENCY_NUMBER } from '../utils/triageRules';
import { useAppStore } from '../store/useAppStore';
import { Hospital, RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type HospitalFinderRouteProp = RouteProp<RootStackParamList, 'HospitalFinder'>;

export default function HospitalFinderScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<HospitalFinderRouteProp>();
  const isEmergency = route.params?.emergency ?? false;

  const isOffline = useAppStore(s => s.isOffline);

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  const fetchNearby = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setLocationError('တည်နေရာ ခွင့်ပြုချက် လိုအပ်ပါသည်\nLocation permission required');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      setUserLocation({ lat: latitude, lon: longitude });

      // Fetch hospitals
      const result = await getHospitalsWithFallback(latitude, longitude, 10);
      setHospitals(result.hospitals);
      setFromCache(result.fromCache);
      setLocationError(null);
    } catch (error) {
      setLocationError('တည်နေရာ ရယူ၍ မရပါ\nCould not get location');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNearby();
  }, [fetchNearby]);

  const handleCallEmergency = () => {
    const phoneUrl = Platform.OS === 'ios'
      ? `telprompt:${MYANMAR_EMERGENCY_NUMBER}`
      : `tel:${MYANMAR_EMERGENCY_NUMBER}`;
    Linking.openURL(phoneUrl).catch(() => {
      console.warn('Cannot open phone dialer');
    });
  };

  const renderHeader = () => (
    <View>
      {/* Emergency banner */}
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
            <Ionicons name="call" size={24} color={colors.white} />
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

      <OfflineBanner />

      {fromCache && (
        <View style={styles.cacheBanner}>
          <Ionicons name="information-circle" size={14} color={colors.teal} />
          <Text style={styles.cacheBannerText}>
            Cached data — pull to refresh
          </Text>
        </View>
      )}

      {/* Results count */}
      {!loading && hospitals.length > 0 && (
        <Text style={styles.resultCount}>
          {hospitals.length} hospital{hospitals.length === 1 ? '' : 's'} found
        </Text>
      )}
    </View>
  );

  const renderEmpty = () => {
    if (loading) return null;

    if (locationError) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="location-outline" size={48} color={colors.textLight} />
          <Text style={styles.emptyTitle}>{locationError}</Text>
          <TouchableOpacity onPress={() => fetchNearby()} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>ပြန်ကြိုးစားပါ (Retry)</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="medical" size={48} color={colors.textLight} />
        <Text style={styles.emptyTitle}>
          ဆေးရုံ မတွေ့ပါ
        </Text>
        <Text style={styles.emptySubtitle}>
          No hospitals found in the database.
        </Text>
      </View>
    );
  };

  return (
    <GradientBackground>
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
              {isEmergency ? 'အရေးပေါ် ဆေးရုံရှာဖွေမှု' : 'အနီးဆုံး ဆေးရုံများ'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isEmergency ? 'Emergency Hospital Search' : 'Nearby Hospitals'}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.teal} />
          <Text style={styles.loadingText}>
            တည်နေရာ ရှာဖွေနေပါသည်...
          </Text>
          <Text style={styles.loadingSubtext}>Finding your location...</Text>
        </View>
      ) : (
        <FlatList
          data={hospitals}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <HospitalCard hospital={item} />}
          contentContainerStyle={styles.list}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchNearby(true)}
              tintColor={colors.teal}
            />
          }
        />
      )}
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 56,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
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
    ...typography.h3,
    fontSize: 17,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  loadingSubtext: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },

  // List
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 100,
  },

  // Emergency banner
  emergencyBanner: {
    marginBottom: spacing.md,
    ...shadows.button,
    shadowColor: '#D4A843',
  },
  emergencyBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    gap: spacing.lg,
  },
  emergencyBannerText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  emergencyBannerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },

  // Cache banner
  cacheBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: '#E8F8F8',
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  cacheBannerText: {
    fontSize: 12,
    color: colors.teal,
    fontWeight: '500',
  },

  // Result count
  resultCount: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textSecondary,
    textAlign: 'center',

  },
  emptySubtitle: {
    ...typography.bodySmall,
    color: colors.textLight,
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
});
