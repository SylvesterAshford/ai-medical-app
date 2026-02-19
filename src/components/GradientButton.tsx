// GradientButton — pill-shaped gradient button

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, borderRadius, shadows, typography } from '../theme';

interface Props {
  title: string;
  onPress: () => void;
  gradient?: readonly string[];
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function GradientButton({
  title,
  onPress,
  gradient,
  style,
  textStyle,
  disabled = false,
  size = 'medium',
}: Props) {
  const sizeStyles = {
    small: { paddingVertical: 10, paddingHorizontal: 20 },
    medium: { paddingVertical: 14, paddingHorizontal: 32 },
    large: { paddingVertical: 18, paddingHorizontal: 48 },
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[shadows.button, style]}
    >
      <LinearGradient
        colors={(gradient || [...gradients.accent]) as [string, string, ...string[]]}
        style={[styles.gradient, sizeStyles[size], disabled && styles.disabled]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={[styles.text, textStyle]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.button,
    color: colors.white,
  },
  disabled: {
    opacity: 0.5,
  },
});
