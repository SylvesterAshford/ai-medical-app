// EmergencyScreen — Full-screen emergency flow
// Triggered by chest pain, breathing difficulty, stroke, severe bleeding, etc.

import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Linking,
  Platform, StatusBar, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography, borderRadius, shadows, gradients } from '../theme';
import { MYANMAR_EMERGENCY_NUMBER } from '../utils/triageRules';
import { useAppStore } from '../store/useAppStore';
import { RootStackParamList } from '../types';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function EmergencyScreen() {
  const navigation = useNavigation<NavigationProp>();
  const setEmergencyMode = useAppStore(s => s.setEmergencyMode);
  const language = useAppStore(s => s.language);

  const handleCallEmergency = () => {
    const phoneUrl = Platform.OS === 'ios'
      ? `telprompt:${MYANMAR_EMERGENCY_NUMBER}`
      : `tel:${MYANMAR_EMERGENCY_NUMBER}`;
    Linking.openURL(phoneUrl).catch(() => {
      console.warn('Cannot open phone dialer');
    });
  };

  const handleFindHospital = () => {
    navigation.navigate('HospitalFinder', { emergency: true });
  };

  const handleBackToChat = () => {
    setEmergencyMode(false);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <LinearGradient
        colors={['#FFF8F0', '#FFF3E6', '#FFEEDD'] as [string, string, ...string[]]}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* Top warning icon */}
        <View style={styles.topSection}>
          <View style={styles.warningIcon}>
            <Ionicons name="warning" size={48} color="#D4A843" />
          </View>

          {/* Main Burmese text */}
          <Text style={styles.mainTextMy}>
            {language === 'my' ? 'အရေးပေါ် ဖြစ်နိုင်ပါသည်' : 'This may be an emergency'}
          </Text>

          <Text style={styles.subtextMy}>
            {language === 'my' ? 'ချက်ချင်း ဆေးဝါးကူညီမှု လိုအပ်နိုင်ပါသည်' : 'You may need immediate medical assistance'}
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actionSection}>
          {/* Call 192 — Big prominent button */}
          <TouchableOpacity
            onPress={handleCallEmergency}
            activeOpacity={0.8}
            style={styles.emergencyBtnWrap}
          >
            <LinearGradient
              colors={['#D4A843', '#C4963A'] as [string, string, ...string[]]}
              style={styles.emergencyBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.emergencyBtnContent}>
                <View style={styles.phoneIconCircle}>
                  <Ionicons name="call" size={28} color="#D4A843" />
                </View>
                <View>
                  <Text style={styles.emergencyBtnText}>
                    {language === 'my' ? `${MYANMAR_EMERGENCY_NUMBER} သို့ ခေါ်ဆိုပါ` : `Call ${MYANMAR_EMERGENCY_NUMBER}`}
                  </Text>
                  <Text style={styles.emergencyBtnSub}>
                    {language === 'my' ? 'လူနာတင်ယာဉ် ခေါ်မည်' : 'Call ambulance'}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Find Hospital */}
          <TouchableOpacity
            onPress={handleFindHospital}
            activeOpacity={0.8}
            style={styles.hospitalBtnWrap}
          >
            <LinearGradient
              colors={[...gradients.teal] as [string, string, ...string[]]}
              style={styles.hospitalBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="location" size={22} color={colors.white} />
              <Text style={styles.hospitalBtnText}>
                {language === 'my' ? 'အနီးဆုံး ဆေးရုံ ရှာမည်' : 'Find Nearest Hospital'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Back to Chat */}
          <TouchableOpacity
            onPress={handleBackToChat}
            activeOpacity={0.7}
            style={styles.backBtn}
          >
            <Ionicons name="chatbubble-ellipses" size={18} color={colors.textSecondary} />
            <Text style={styles.backBtnText}>
              {language === 'my' ? 'Chat သို့ ပြန်သွားမည်' : 'Back to Chat'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerSection}>
          <Text style={styles.disclaimerText}>
            {language === 'my'
              ? 'ဒီ AI သည် ဆရာဝန်မဟုတ်ပါ။ အရေးပေါ် အခြေအနေတွင် ဆေးရုံသို့ ချက်ချင်းသွားပါ။'
              : 'This AI is not a doctor. In an emergency, go to the hospital immediately.'}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: height * 0.1,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.xxl,
  },

  // Top section
  topSection: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  warningIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FDF2D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
    ...shadows.card,
  },
  mainTextMy: {
    fontSize: 28,
    fontWeight: '700',
    color: '#8B6914',
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: 40,
  },
  mainTextEn: {
    fontSize: 16,
    fontWeight: '500',
    color: '#B8932E',
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  subtextMy: {
    fontSize: 15,
    color: '#9A7B2C',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xs,
  },
  subtextEn: {
    fontSize: 13,
    color: '#B8932E',
    textAlign: 'center',
  },

  // Action section
  actionSection: {
    gap: spacing.lg,
  },
  emergencyBtnWrap: {
    ...shadows.button,
    shadowColor: '#D4A843',
  },
  emergencyBtn: {
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxl,
  },
  emergencyBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  phoneIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyBtnText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 2,
  },
  emergencyBtnSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  hospitalBtnWrap: {
    ...shadows.button,
  },
  hospitalBtn: {
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: spacing.xs,
  },
  hospitalBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.white,
  },
  hospitalBtnSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  backBtnText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  // Disclaimer
  disclaimerSection: {
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#F0E4B8',
  },
  disclaimerText: {
    fontSize: 11,
    color: '#B8932E',
    textAlign: 'center',
    lineHeight: 18,
  },
});
