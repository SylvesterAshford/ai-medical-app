// Subscription Screen — Modal overlay with pricing cards

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import GradientButton from '../components/GradientButton';
import { colors, spacing, typography, borderRadius, shadows, gradients } from '../theme';
import { useAppStore } from '../store/useAppStore';

const { width, height } = Dimensions.get('window');

interface PlanCardProps {
  name: string;
  price: string;
  period: string;
  features: string[];
  isBestOffer: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

function PlanCard({ name, price, period, features, isBestOffer, isSelected, onSelect }: PlanCardProps) {
  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.85}
      style={[
        styles.planCard,
        isSelected && styles.planCardSelected,
      ]}
    >
      {isBestOffer && (
        <View style={styles.bestOfferBadge}>
          <Text style={styles.bestOfferText}>BEST OFFER</Text>
        </View>
      )}

      <View style={styles.planHeader}>
        <View style={[styles.radio, isSelected && styles.radioSelected]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
        <View style={styles.planInfo}>
          <Text style={styles.planName}>{name}</Text>
          <Text style={styles.planPeriod}>{period}</Text>
        </View>
        <Text style={styles.planPrice}>{price}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function SubscriptionScreen({ navigation }: any) {
  const [selectedPlan, setSelectedPlan] = useState(1);
  const language = useAppStore(s => s.language);

  const plans = [
    {
      name: language === 'my' ? 'အပတ်စဉ်' : 'Weekly',
      price: '$2.99',
      period: language === 'my' ? '၇ ရက်' : '7 days',
      features: [],
      isBestOffer: false,
    },
    {
      name: language === 'my' ? 'လစဉ်' : 'Monthly',
      price: '$7.99',
      period: language === 'my' ? '၃၀ ရက်' : '30 days',
      features: [],
      isBestOffer: true,
    },
    {
      name: language === 'my' ? 'နှစ်စဉ်' : 'Yearly',
      price: '$49.99',
      period: language === 'my' ? '၃၆၅ ရက်' : '365 days',
      features: [],
      isBestOffer: false,
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(212, 241, 244, 0.95)', 'rgba(168, 218, 220, 0.95)']}
        style={styles.background}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>

          {/* Header with crown */}
          <View style={styles.headerSection}>
            <View style={styles.crownCircle}>
              <Ionicons name="diamond" size={32} color="#FDCB6E" />
            </View>
            <Text style={styles.title}>{language === 'my' ? 'စာရင်းသွင်းခြင်း' : 'Subscription'}</Text>
            <Text style={styles.subtitle}>
              {language === 'my' ? 'အချက်အလက်အားလုံးကို အကန့်အသတ်မဲ့ ရယူပါ' : 'Get unlimited access to all features'}
            </Text>
          </View>

          {/* Plan Cards */}
          <View style={styles.plansContainer}>
            {plans.map((plan, index) => (
              <PlanCard
                key={index}
                {...plan}
                isSelected={selectedPlan === index}
                onSelect={() => setSelectedPlan(index)}
              />
            ))}
          </View>

          {/* Features list */}
          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>{language === 'my' ? 'ပါဝင်သည့်အရာများ' : "What's included"}</Text>
            {(language === 'my' ? [
              'AI စကားပြောခြင်း အကန့်မဲ့',
              'အဆင့်မြင့် ပုံခွဲခြမ်း',
              'သာလူအရင် တုံ့ပြန်ချိန်',
              'ကျန်းမာရေး ရပို့ ထုတ်ယူခြင်း',
              'ကြော်ညာကင်း အသုံးပြုခြင်း',
              'ဘာသာစကားများစွာ ပံ့ပိုးမှု',
            ] : [
              'Unlimited AI conversations',
              'Advanced image analysis',
              'Priority response time',
              'Health report exports',
              'Ad-free experience',
              'Multi-language support',
            ]).map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={20} color={colors.teal} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <GradientButton
            title={language === 'my' ? 'အပြည့်အဝင် ရယူပါ' : 'Get Full Access'}
            onPress={() => {}}
            size="large"
            style={styles.ctaBtn}
          />

          <Text style={styles.termsText}>
            {language === 'my' ? 'အလိုအလျာက် အသစ်ပြုနိုင်ပါသည်။' : 'Auto-renewable. Cancel anytime.'}{'\n'}
            <Text style={styles.termsLink}>{language === 'my' ? 'ဝန်ဆောင်မှုစည်းကမ်း' : 'Terms of Service'}</Text>
            {' • '}
            <Text style={styles.termsLink}>{language === 'my' ? 'ကိုယ်ရေးအချက်အလက် မူဝါဒ' : 'Privacy Policy'}</Text>
          </Text>

          <TouchableOpacity style={styles.restoreBtn}>
            <Text style={styles.restoreText}>{language === 'my' ? 'ဝယ်ယူမှုများ ပြန်ရယူပါ' : 'Restore Purchases'}</Text>
          </TouchableOpacity>

          <View style={{ height: spacing.huge }} />
        </ScrollView>
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
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },

  closeBtn: {
    position: 'absolute',
    top: 52,
    right: spacing.xl,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  headerSection: {
    alignItems: 'center',
    paddingTop: 60,
    marginBottom: spacing.xxl,
  },
  crownCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(253, 203, 110, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Plans
  plansContainer: {
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.xxl,
  },
  planCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.card,
    position: 'relative',
    overflow: 'visible',
  },
  planCardSelected: {
    borderColor: colors.teal,
    backgroundColor: '#F0FFFE',
  },
  bestOfferBadge: {
    position: 'absolute',
    top: -10,
    right: spacing.lg,
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  bestOfferText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    fontSize: 10,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  radioSelected: {
    borderColor: colors.teal,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.teal,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    ...typography.h3,
    fontSize: 16,
  },
  planPeriod: {
    ...typography.bodySmall,
  },
  planPrice: {
    ...typography.h2,
    color: colors.teal,
  },

  // Features
  featuresSection: {
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.xxl,
  },
  featuresTitle: {
    ...typography.h3,
    marginBottom: spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureText: {
    ...typography.body,
    marginLeft: spacing.md,
  },

  // CTA
  ctaBtn: {
    marginHorizontal: spacing.xxl,
    marginBottom: spacing.lg,
  },
  termsText: {
    ...typography.caption,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  termsLink: {
    color: colors.teal,
  },
  restoreBtn: {
    alignItems: 'center',
  },
  restoreText: {
    ...typography.body,
    color: colors.teal,
    fontWeight: '600',
  },
});
