// TriageQuestionCard — Reusable Yes/No triage question component

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import { TriageQuestion } from '../types';
import { colors, spacing, typography, borderRadius, gradients, shadows } from '../theme';

interface Props {
  question: TriageQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (questionId: string, answer: boolean) => void;
}

export default function TriageQuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
}: Props) {
  return (
    <Card style={styles.card}>
      {/* Progress indicator */}
      <View style={styles.progressRow}>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${(questionNumber / totalQuestions) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {questionNumber}/{totalQuestions}
        </Text>
      </View>

      {/* Question icon */}
      <View style={styles.iconWrap}>
        <Ionicons name="help-circle" size={28} color={colors.teal} />
      </View>

      {/* Question text */}
      <Text style={styles.questionMy}>{question.questionTextMy}</Text>
      <Text style={styles.questionEn}>{question.questionTextEn}</Text>

      {/* Answer buttons */}
      <View style={styles.answerRow}>
        <TouchableOpacity
          onPress={() => onAnswer(question.id, true)}
          activeOpacity={0.8}
          style={styles.answerBtnWrap}
        >
          <LinearGradient
            colors={[...gradients.teal] as [string, string, ...string[]]}
            style={styles.answerBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.answerBtnText}>ဟုတ်ကဲ့ (Yes)</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onAnswer(question.id, false)}
          activeOpacity={0.8}
          style={styles.answerBtnWrap}
        >
          <View style={styles.noBtn}>
            <Text style={styles.noBtnText}>မဟုတ်ပါ (No)</Text>
          </View>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.teal,
    borderRadius: 2,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.tealLight + '30',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  questionMy: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: 28,
  },
  questionEn: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  answerRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  answerBtnWrap: {
    flex: 1,
    ...shadows.button,
  },
  answerBtn: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerBtnText: {
    ...typography.button,
    fontSize: 15,
    color: colors.white,
  },
  noBtn: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F4F4',
    borderWidth: 1,
    borderColor: colors.border,
  },
  noBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
