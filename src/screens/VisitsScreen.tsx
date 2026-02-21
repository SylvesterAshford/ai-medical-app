// Health Tools Screen — BMI, Symptom Checker, Risk Calculator

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../components/GradientBackground';
import Card from '../components/Card';
import GradientButton from '../components/GradientButton';
import { colors, spacing, typography, borderRadius, shadows, gradients } from '../theme';
import { calculateBMI } from '../utils';
import { BMIResult } from '../types';
import { useAppStore } from '../store/useAppStore';

const { width } = Dimensions.get('window');

export default function HealthToolsScreen({ navigation }: any) {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmiResult, setBmiResult] = useState<BMIResult | null>(null);
  const language = useAppStore(s => s.language);

  const handleCalculateBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (w > 0 && h > 0) {
      setBmiResult(calculateBMI(w, h));
    }
  };

  return (
    <GradientBackground>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={[...gradients.header]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>{language === 'my' ? 'ကျန်းမာရေး ကိရိယာများ' : 'Health Tools'}</Text>
          <Text style={styles.headerSubtitle}>
            {language === 'my' ? 'ကျန်းမာရေး အချက်အလက်များ စစ်ဆေးပါ' : 'Track and monitor your health metrics'}
          </Text>
        </LinearGradient>

        {/* BMI Calculator */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrap}>
              <Ionicons name="body" size={20} color={colors.teal} />
            </View>
            <Text style={styles.sectionTitle}>{language === 'my' ? 'BMI တွက်စက်' : 'BMI Calculator'}</Text>
          </View>

          <Card>
            <View style={styles.inputRow}>
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>{language === 'my' ? 'ကိုယ်အလေးချိန် (kg)' : 'Weight (kg)'}</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.input}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                    placeholder="70"
                    placeholderTextColor={colors.textLight}
                  />
                  <Text style={styles.unitLabel}>kg</Text>
                </View>
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>{language === 'my' ? 'အရပ် (cm)' : 'Height (cm)'}</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.input}
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="numeric"
                    placeholder="170"
                    placeholderTextColor={colors.textLight}
                  />
                  <Text style={styles.unitLabel}>cm</Text>
                </View>
              </View>
            </View>

            <GradientButton
              title={language === 'my' ? 'BMI တွက်ပါ' : 'Calculate BMI'}
              onPress={handleCalculateBMI}
              size="medium"
              gradient={[...gradients.teal]}
              style={styles.calcBtn}
            />

            {bmiResult && (
              <View style={styles.resultContainer}>
                <View style={[styles.resultBadge, { backgroundColor: bmiResult.color + '20' }]}>
                  <Text style={[styles.resultValue, { color: bmiResult.color }]}>
                    {bmiResult.bmi}
                  </Text>
                </View>
                <Text style={[styles.resultCategory, { color: bmiResult.color }]}>
                  {bmiResult.category}
                </Text>
                <View style={styles.bmiScale}>
                  {['Underweight', 'Normal', 'Overweight', 'Obese'].map((cat, i) => (
                    <View
                      key={cat}
                      style={[
                        styles.scaleSegment,
                        {
                          backgroundColor: [
                            '#74B9FF', '#00B894', '#FDCB6E', '#E17055'
                          ][i] + (cat === bmiResult.category ? 'FF' : '40'),
                        },
                      ]}
                    />
                  ))}
                </View>
                <View style={styles.scaleLabelRow}>
                  <Text style={styles.scaleLabel}>18.5</Text>
                  <Text style={styles.scaleLabel}>25</Text>
                  <Text style={styles.scaleLabel}>30</Text>
                </View>
              </View>
            )}
          </Card>
        </View>

        {/* Symptom Checker */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrap}>
              <Ionicons name="search" size={20} color={colors.accentGradientStart} />
            </View>
            <Text style={styles.sectionTitle}>{language === 'my' ? 'ရောဂါလက္ခဏာ စစ်ဆေးရန်' : 'Symptom Checker'}</Text>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Companion')} activeOpacity={0.85}>
            <Card style={styles.toolCard}>
              <View style={styles.toolCardContent}>
                <View>
                  <Text style={styles.toolCardTitle}>{language === 'my' ? 'ရောဂါလက္ခဏာ စစ်ဆေးပါ' : 'Check Your Symptoms'}</Text>
                  <Text style={styles.toolCardDesc}>
                    {language === 'my' ? 'AI လမ်းညွှန်ချက်အတွက် ရောဂါလက္ခဏာများ ဖော်ပြပါ' : 'Describe your symptoms to our AI assistant for preliminary guidance'}
                  </Text>
                </View>
                <View style={styles.toolArrow}>
                  <Ionicons name="arrow-forward" size={20} color={colors.teal} />
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Health Risk Calculator */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrap}>
              <Ionicons name="heart" size={20} color="#E17055" />
            </View>
            <Text style={styles.sectionTitle}>{language === 'my' ? 'ကျန်းမာရေးအန္တရာယ် အကဲဖြတ်ခြင်း' : 'Health Risk Assessment'}</Text>
          </View>

          <Card style={styles.toolCard}>
            <View style={styles.riskRow}>
              <TouchableOpacity style={styles.riskItem}>
                <View style={[styles.riskIcon, { backgroundColor: '#FFE8E0' }]}>
                  <Ionicons name="heart" size={24} color="#E17055" />
                </View>
                <Text style={styles.riskLabel}>{language === 'my' ? 'နှလုံးကျန်းမာရေး' : 'Heart Health'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.riskItem}>
                <View style={[styles.riskIcon, { backgroundColor: '#E8F8F8' }]}>
                  <Ionicons name="water" size={24} color={colors.teal} />
                </View>
                <Text style={styles.riskLabel}>{language === 'my' ? 'ဆီးချိုအန္တရာယ်' : 'Diabetes Risk'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.riskItem}>
                <View style={[styles.riskIcon, { backgroundColor: '#F0E8FF' }]}>
                  <Ionicons name="fitness" size={24} color={colors.accentGradientStart} />
                </View>
                <Text style={styles.riskLabel}>{language === 'my' ? 'ကြံ့ခိုင်မှုအမှတ်' : 'Fitness Score'}</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{language === 'my' ? 'နေ့စဉ်ကျန်းမာရေး အကြံပြုချက်' : 'Daily Health Tips'}</Text>
          <Card style={styles.tipCard}>
            <Ionicons name="bulb" size={22} color="#FDCB6E" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>{language === 'my' ? 'ရေများများ သောက်ပါ' : 'Stay Hydrated'}</Text>
              <Text style={styles.tipDesc}>
                {language === 'my'
                  ? 'တစ်နေ့လျှင် ရေ ၈ ခွက်အနည်းဆုံး သောက်ပါ။ ရေဓာတ်ပြည့်ဝခြင်းသည် ခန္ဓာကိုယ်လုပ်ငန်းအားလုံးကို ပံ့ပိုးပေးပါသည်။'
                  : 'Drink at least 8 glasses of water daily. Proper hydration supports all body functions.'}
              </Text>
            </View>
          </Card>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 40 },

  header: {
    paddingTop: 64,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xxl,
    borderBottomLeftRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
  },
  headerTitle: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },

  section: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
  },

  // BMI
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  inputWrap: { flex: 1 },
  inputLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: colors.text,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFA',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  unitLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  calcBtn: {
    marginBottom: spacing.lg,
  },
  resultContainer: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resultBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  resultValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  resultCategory: {
    ...typography.h3,
    marginBottom: spacing.lg,
  },
  bmiScale: {
    flexDirection: 'row',
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  scaleSegment: {
    flex: 1,
  },
  scaleLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  scaleLabel: {
    ...typography.caption,
  },

  // Tool cards
  toolCard: {},
  toolCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolCardTitle: {
    ...typography.h3,
    fontSize: 15,

    paddingTop: 4,
    marginBottom: spacing.xs,
  },
  toolCardDesc: {
    ...typography.bodySmall,
    maxWidth: width * 0.55,
  },
  toolArrow: {
    marginLeft: 'auto',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Risk
  riskRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  riskItem: {
    alignItems: 'center',
  },
  riskIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  riskLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    fontSize: 11,
    color: colors.text,
  },

  // Tips
  tipCard: {
    flexDirection: 'row',
    padding: spacing.lg,
    alignItems: 'flex-start',
  },
  tipContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  tipTitle: {
    ...typography.h3,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  tipDesc: {
    ...typography.bodySmall,

  },
});
