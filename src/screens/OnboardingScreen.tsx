// Onboarding Screen

import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../components/GradientBackground';
import GradientButton from '../components/GradientButton';
import { colors, spacing, typography, gradients } from '../theme';
import { useAppStore } from '../store/useAppStore';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }: any) {
  const setOnboardingSeen = useAppStore(s => s.setOnboardingSeen);

  const handleGetStarted = () => {
    setOnboardingSeen();
    // Navigation handled automatically by conditional rendering in AppNavigator
  };

  return (
    <GradientBackground colors={[...gradients.primary]}>
      <View style={styles.container}>
        {/* Top decoration */}
        <View style={styles.topSection}>
          <View style={styles.logoRow}>
            <View style={styles.logoBadge}>
              <Ionicons name="medical" size={28} color={colors.white} />
            </View>
            <Text style={styles.appName}>MediAI</Text>
          </View>

          {/* Illustration placeholder */}
          <View style={styles.illustration}>
            <View style={styles.illustCircle1} />
            <View style={styles.illustCircle2} />
            <View style={styles.illustCircle3} />
            <Ionicons name="heart" size={60} color={colors.teal} style={styles.heartIcon} />
            <View style={styles.pulseContainer}>
              <Ionicons name="pulse" size={80} color={colors.accentGradientStart} />
            </View>
          </View>
        </View>

        {/* Bottom section */}
        <View style={styles.bottomSection}>
          <Text style={styles.title}>Myanmar's AI{"\n"}Health Navigator</Text>
          <Text style={styles.subtitle}>
            ဆရာဝန်ကို အစားထိုးခြင်း မဟုတ်ပါ။{"\n"}
            ကျန်းမာရေး လမ်းညွှန် ပေးခြင်းနှင့်{"\n"}
            အနီးဆုံး ဆေးရုံ ရှာဖွေပေးခြင်း ဖြစ်ပါသည်။
          </Text>

          <GradientButton
            title="Get Started"
            onPress={handleGetStarted}
            size="large"
            style={styles.button}
          />

          <Text style={styles.signInText}>
            Already have an account?{' '}
            <Text
              style={styles.signInLink}
              onPress={handleGetStarted}
            >
              Sign in here
            </Text>
          </Text>
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topSection: {
    flex: 1,
    alignItems: 'center',
    paddingTop: height * 0.08,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -1,
  },
  illustration: {
    width: width * 0.7,
    height: width * 0.7,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  illustCircle1: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(93, 173, 226, 0.1)',
  },
  illustCircle2: {
    position: 'absolute',
    width: width * 0.45,
    height: width * 0.45,
    borderRadius: width * 0.225,
    backgroundColor: 'rgba(93, 173, 226, 0.15)',
  },
  illustCircle3: {
    position: 'absolute',
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    backgroundColor: 'rgba(93, 173, 226, 0.2)',
  },
  heartIcon: {
    position: 'absolute',
    top: '30%',
    left: '25%',
  },
  pulseContainer: {
    position: 'absolute',
  },
  bottomSection: {
    paddingHorizontal: spacing.xxxl,
    paddingBottom: height * 0.06,
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    fontSize: 30,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
    lineHeight: 24,
  },
  button: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  signInText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  signInLink: {
    color: colors.teal,
    fontWeight: '600',
  },
});
