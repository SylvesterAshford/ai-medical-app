// GradientBackground — wraps screens in soft gradient

import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '../theme';

interface Props {
  children: React.ReactNode;
  colors?: readonly string[];
  style?: ViewStyle;
}

export default function GradientBackground({ children, colors, style }: Props) {
  return (
    <LinearGradient
      colors={(colors || [...gradients.background]) as [string, string, ...string[]]}
      style={[styles.container, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
