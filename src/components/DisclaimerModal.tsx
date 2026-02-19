// DisclaimerModal — medical disclaimer before first chat

import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography, shadows } from '../theme';
import GradientButton from './GradientButton';
import { MEDICAL_DISCLAIMER } from '../utils';

interface Props {
  visible: boolean;
  onAccept: () => void;
}

export default function DisclaimerModal({ visible, onAccept }: Props) {
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

          <Text style={styles.title}>Medical Disclaimer</Text>

          <Text style={styles.body}>{MEDICAL_DISCLAIMER}</Text>

          <View style={styles.divider} />

          <View style={styles.checkRow}>
            <Ionicons name="shield-checkmark" size={20} color={colors.success} />
            <Text style={styles.checkText}>
              Your conversations are private and secure
            </Text>
          </View>

          <View style={styles.checkRow}>
            <Ionicons name="alert-circle" size={20} color={colors.warning} />
            <Text style={styles.checkText}>
              For emergencies, always call local emergency services
            </Text>
          </View>

          <GradientButton
            title="I Understand"
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
    lineHeight: 20,
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
