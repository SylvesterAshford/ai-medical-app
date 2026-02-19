// OfflineBanner — Displays when offline mode is active

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { colors, spacing, borderRadius } from '../theme';

export default function OfflineBanner() {
  const isOffline = useAppStore(s => s.isOffline);
  const language = useAppStore(s => s.language);

  if (!isOffline) return null;

  return (
    <View style={styles.banner}>
      <Ionicons name="cloud-offline" size={16} color="#9A7B2C" />
      <Text style={styles.text}>
        {language === 'my'
          ? 'အော့ဖ်လိုင်း — ဆေးရုံ ရှာဖွေမှု ရနိုင်ပါသည်'
          : 'Offline mode — Hospital search available'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDF8E8',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    borderRadius: borderRadius.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: '#F0E4B8',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9A7B2C',
  },
});
