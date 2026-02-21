// DisclaimerModal — medical disclaimer before first chat

import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography, shadows } from '../theme';
import GradientButton from './GradientButton';
import { useAppStore } from '../store/useAppStore';
import { t } from '../utils/translations';

interface Props {
  visible: boolean;
  onAccept: () => void;
}

export default function DisclaimerModal({ visible, onAccept }: Props) {
  const language = useAppStore(s => s.language);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.iconContainer}>
            <Ionicons name="medical" size={36} color={colors.teal} />
          </View>

          <Text style={styles.title}>{t('disclaimer.title', language)}</Text>

          <Text style={styles.body}>{t('disclaimer.body', language)}</Text>

          <View style={styles.divider} />

          <View style={styles.checkRow}>
            <Ionicons name="shield-checkmark" size={20} color={colors.success} />
            <Text style={styles.checkText}>
              {language === 'my' ? 'သင့်စကားပြောမှုများသည် လုံခြုံပါသည်' : 'Your conversations are private and secure'}
            </Text>
          </View>

          <View style={styles.checkRow}>
            <Ionicons name="alert-circle" size={20} color={colors.warning} />
            <Text style={styles.checkText}>
              {language === 'my' ? 'အရေးပေါ်အတွက် 192 သို့ ခေါ်ဆိုပါ' : 'For emergencies, always call local emergency services'}
            </Text>
          </View>

          <GradientButton
            title={t('disclaimer.accept', language)}
            onPress={onAccept}
            size="large"
            style={styles.button}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    ...shadows.modal,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  body: {
    ...typography.bodySmall,
    textAlign: 'center',

    marginBottom: spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    width: '100%',
    marginBottom: spacing.lg,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
    width: '100%',
  },
  checkText: {
    ...typography.bodySmall,
    marginLeft: spacing.sm,
    flex: 1,
  },
  button: {
    marginTop: spacing.lg,
    width: '100%',
  },
});
