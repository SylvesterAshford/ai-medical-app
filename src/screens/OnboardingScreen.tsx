// Onboarding Screen

import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, Animated, Platform, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GradientButton from '../components/GradientButton';
import { colors, spacing, typography, gradients, shadows } from '../theme';
import { useAppStore } from '../store/useAppStore';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }: any) {
  const setOnboardingSeen = useAppStore(s => s.setOnboardingSeen);

  // Animations
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;
  const iconScale = useRef(new Animated.Value(0.6)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const floatY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(iconScale, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();

    // Continuous floating
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, { toValue: -6, duration: 2000, useNativeDriver: true }),
        Animated.timing(floatY, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    // Continuous pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleGetStarted = () => {
    setOnboardingSeen();
  };

  return (
    <LinearGradient
      colors={['#CFEFEF', '#B8E6E8', '#A8DADC']}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      {/* Top logo & brand */}
      <Animated.View style={[styles.topBar, { opacity: fadeIn }]}>
        <Image source={require('../../assets/logo.png')} style={[styles.brandLogo, { tintColor: colors.text }]} resizeMode="contain" />
        <Text style={styles.brandName}>ZawgyiAI</Text>
      </Animated.View>

      {/* Center illustration */}
      <Animated.View style={[styles.illustrationSection, {
        opacity: fadeIn,
        transform: [{ scale: iconScale }, { translateY: floatY }],
      }]}>
        {/* Pulsing outer ring */}
        <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulse }] }]} />

        {/* Concentric circles */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />

        {/* Heart icon */}
        <Ionicons name="heart" size={56} color={colors.teal} style={styles.heartIcon} />

        {/* Pulse line */}
        <View style={styles.pulseContainer}>
          <Ionicons name="pulse" size={72} color={colors.accentGradientStart} />
        </View>
      </Animated.View>

      {/* Bottom content */}
      <Animated.View style={[styles.bottomSection, {
        opacity: fadeIn,
        transform: [{ translateY: slideUp }],
      }]}>
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
          gradient={[...gradients.teal]}
          style={styles.button}
        />

        <Text style={styles.signInText}>
          Already have an account?{' '}
          <Text style={styles.signInLink} onPress={handleGetStarted}>
            Sign in here
          </Text>
        </Text>
      </Animated.View>
    </LinearGradient>
  );
}

const ILLUST_SIZE = width * 0.65;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Top Bar (Premium layout)
  topBar: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogo: {
    width: 32,
    height: 32,
    marginRight: 6, // Tighter spacing
  },
  brandName: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.8,
  },

  // Illustration
  illustrationSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: ILLUST_SIZE + 20,
    height: ILLUST_SIZE + 20,
    borderRadius: (ILLUST_SIZE + 20) / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(93,173,226,0.12)',
  },
  circle1: {
    position: 'absolute',
    width: ILLUST_SIZE,
    height: ILLUST_SIZE,
    borderRadius: ILLUST_SIZE / 2,
    backgroundColor: 'rgba(93,173,226,0.1)',
  },
  circle2: {
    position: 'absolute',
    width: ILLUST_SIZE * 0.72,
    height: ILLUST_SIZE * 0.72,
    borderRadius: (ILLUST_SIZE * 0.72) / 2,
    backgroundColor: 'rgba(93,173,226,0.15)',
  },
  circle3: {
    position: 'absolute',
    width: ILLUST_SIZE * 0.46,
    height: ILLUST_SIZE * 0.46,
    borderRadius: (ILLUST_SIZE * 0.46) / 2,
    backgroundColor: 'rgba(93,173,226,0.2)',
  },
  heartIcon: {
    position: 'absolute',
    top: '30%',
    left: '28%',
  },
  pulseContainer: {
    position: 'absolute',
  },

  // Bottom
  bottomSection: {
    paddingHorizontal: spacing.xxxl,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 42,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: spacing.xxxl,
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
