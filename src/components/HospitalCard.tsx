// HospitalCard — Displays hospital info with call/directions actions

import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Linking, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Card from './Card';
import { Hospital } from '../types';
import { colors, spacing, typography, borderRadius, gradients, shadows } from '../theme';
import { getGoogleMapsDirectionsUrl } from '../services/hospitals';

interface Props {
  hospital: Hospital;
}

export default function HospitalCard({ hospital }: Props) {
  const handleCall = () => {
    const phoneUrl = Platform.OS === 'ios'
      ? `telprompt:${hospital.phone}`
      : `tel:${hospital.phone}`;
    Linking.openURL(phoneUrl).catch(() => {
      console.warn('Cannot open phone dialer');
    });
  };

  const handleDirections = () => {
    const url = getGoogleMapsDirectionsUrl(
      hospital.latitude,
      hospital.longitude,
      hospital.name
    );
    Linking.openURL(url).catch(() => {
      console.warn('Cannot open Google Maps');
    });
  };

  return (
    <Card style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.iconContainer}>
          <Ionicons name="medical" size={20} color={colors.teal} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name} numberOfLines={2}>{hospital.name}</Text>
          <Text style={styles.city}>{hospital.city}</Text>
        </View>
      </View>

      {/* Badges */}
      <View style={styles.badgeRow}>
        <View style={[
          styles.typeBadge,
          hospital.type === 'public' ? styles.publicBadge : styles.privateBadge,
        ]}>
          <Text style={[
            styles.badgeText,
            hospital.type === 'public' ? styles.publicBadgeText : styles.privateBadgeText,
          ]}>
            {hospital.type === 'public' ? 'Public' : 'Private'}
          </Text>
        </View>

        {hospital.emergency_24hr && (
          <View style={styles.emergencyBadge}>
            <Ionicons name="time" size={12} color="#D4A843" />
            <Text style={styles.emergencyBadgeText}>24hr Emergency</Text>
          </View>
        )}

        {hospital.distance !== undefined && (
          <View style={styles.distanceBadge}>
            <Ionicons name="location" size={12} color={colors.teal} />
            <Text style={styles.distanceText}>{hospital.distance} km</Text>
          </View>
        )}
      </View>

      {/* Phone */}
      {hospital.phone && (
        <View style={styles.phoneRow}>
          <Ionicons name="call" size={14} color={colors.textSecondary} />
          <Text style={styles.phoneText}>{hospital.phone}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity onPress={handleCall} activeOpacity={0.8} style={styles.actionBtnWrap}>
          <LinearGradient
            colors={[...gradients.teal] as [string, string, ...string[]]}
            style={styles.actionBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="call" size={16} color={colors.white} />
            <Text style={styles.actionBtnText}>Call Now</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleDirections} activeOpacity={0.8} style={styles.actionBtnWrap}>
          <LinearGradient
            colors={[...gradients.accent] as [string, string, ...string[]]}
            style={styles.actionBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="navigate" size={16} color={colors.white} />
            <Text style={styles.actionBtnText}>Directions</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.tealLight + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    ...typography.h3,
    fontSize: 16,
    marginBottom: 2,
  },
  city: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  typeBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  publicBadge: {
    backgroundColor: colors.tealLight + '40',
  },
  privateBadge: {
    backgroundColor: colors.accentGradientStart + '20',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  publicBadgeText: {
    color: colors.tealDark,
  },
  privateBadgeText: {
    color: colors.accentGradientEnd,
  },
  emergencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: '#FDF2D0',
    gap: 4,
  },
  emergencyBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9A7B2C',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: '#E8F8F8',
    gap: 4,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.teal,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  phoneText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionBtnWrap: {
    flex: 1,
    ...shadows.button,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
  },
  actionBtnText: {
    ...typography.button,
    fontSize: 13,
    color: colors.white,
  },
});
