// Home Screen

import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../components/GradientBackground';
import Card from '../components/Card';
import GradientButton from '../components/GradientButton';
import { colors, spacing, typography, borderRadius, shadows, gradients } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { getGreeting } from '../utils';

const { width } = Dimensions.get('window');

interface FeatureCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  iconBg: string;
  hasArrow?: boolean;
  hasButton?: boolean;
}

function FeatureCard({ icon, title, subtitle, onPress, iconBg, hasArrow, hasButton }: FeatureCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Card style={styles.featureCard}>
        <View style={[styles.featureIcon, { backgroundColor: iconBg + '20' }]}>
          <Ionicons name={icon} size={24} color={iconBg} />
        </View>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureSubtitle}>{subtitle}</Text>
        {hasButton && (
          <GradientButton
            title="Start Talking"
            onPress={onPress}
            size="small"
            style={styles.featureBtn}
          />
        )}
        {hasArrow && (
          <View style={styles.arrowRow}>
            <Ionicons name="arrow-forward" size={18} color={colors.teal} />
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

interface TopicCardProps {
  title: string;
  description: string;
  onPress: () => void;
}

function TopicCard({ title, description, onPress }: TopicCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.topicCardWrap}>
      <Card style={styles.topicCard}>
        <Text style={styles.topicTitle}>{title}</Text>
        <Text style={styles.topicDesc} numberOfLines={2}>{description}</Text>
        <GradientButton
          title="Discover"
          onPress={onPress}
          size="small"
          gradient={[...gradients.teal]}
          style={styles.topicBtn}
        />
      </Card>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }: any) {
  const user = useAppStore(s => s.user);
  const greeting = getGreeting();

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
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={24} color={colors.teal} />
              </View>
              <View>
                <Text style={styles.headerLabel}>MediAI</Text>
                <Text style={styles.headerSubLabel}>Welcome Back</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.notifBell}>
              <Ionicons name="notifications" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={styles.greeting}>
            {greeting} How{'\n'}can I help you?
          </Text>
        </LinearGradient>

        {/* Feature Cards Grid */}
        <View style={styles.cardsSection}>
          <View style={styles.cardsRow}>
            {/* Left — Talk to AI (tall card) */}
            <View style={styles.leftCard}>
              <FeatureCard
                icon="chatbubble-ellipses"
                title="Talk to AI assistant"
                subtitle="Let's try it now"
                onPress={() => navigation.navigate('Chat')}
                iconBg={colors.accentGradientStart}
                hasButton
              />
            </View>

            {/* Right column — 2 cards stacked */}
            <View style={styles.rightColumn}>
              <FeatureCard
                icon="body"
                title="BMI Check"
                subtitle="Calculate body mass index"
                onPress={() => navigation.navigate('HealthTools')}
                iconBg={colors.teal}
                hasArrow
              />
              <View style={{ height: spacing.md }} />
              <FeatureCard
                icon="image"
                title="Image Analysis"
                subtitle="Analyze your health-related images"
                onPress={() => navigation.navigate('ImageAnalysis')}
                iconBg={colors.teal}
                hasArrow
              />
            </View>
          </View>
        </View>

        {/* Topics Section */}
        <View style={styles.topicsHeader}>
          <Text style={styles.topicsTitle}>Topics</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topicsRow}
        >
          <TopicCard
            title="What is blood pressure?"
            description="Blood pressure measures the force of blood against artery walls..."
            onPress={() => {}}
          />
          <TopicCard
            title="Why is sleep important?"
            description="Quality sleep helps repair the body and supports immune function..."
            onPress={() => {}}
          />
          <TopicCard
            title="Heart health basics"
            description="Learn about maintaining a healthy heart through diet and exercise..."
            onPress={() => {}}
          />
          <TopicCard
            title="Managing stress"
            description="Chronic stress affects both mental and physical health. Learn coping strategies..."
            onPress={() => {}}
          />
        </ScrollView>

        <View style={{ height: spacing.huge }} />
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 100 },

  // Header
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerLabel: {
    ...typography.h3,
    fontSize: 16,
  },
  headerSubLabel: {
    ...typography.bodySmall,
    fontSize: 12,
  },
  notifBell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  greeting: {
    ...typography.h1,
    fontSize: 26,
    lineHeight: 34,
  },

  // Feature cards
  cardsSection: {
    paddingHorizontal: spacing.xl,
    marginTop: -spacing.sm,
  },
  cardsRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
  },
  leftCard: {
    flex: 1,
    marginRight: spacing.md,
  },
  rightColumn: {
    flex: 1,
  },
  featureCard: {
    padding: spacing.lg,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  featureTitle: {
    ...typography.h3,
    fontSize: 15,
    marginBottom: spacing.xs,
  },
  featureSubtitle: {
    ...typography.bodySmall,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  featureBtn: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  arrowRow: {
    alignSelf: 'flex-end',
  },

  // Topics
  topicsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    marginTop: spacing.xxl,
    marginBottom: spacing.lg,
  },
  topicsTitle: {
    ...typography.h2,
  },
  seeAll: {
    ...typography.body,
    color: colors.teal,
    fontWeight: '600',
  },
  topicsRow: {
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  topicCardWrap: {
    width: width * 0.42,
  },
  topicCard: {
    padding: spacing.lg,
  },
  topicTitle: {
    ...typography.h3,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  topicDesc: {
    ...typography.bodySmall,
    fontSize: 12,
    marginBottom: spacing.md,
  },
  topicBtn: {
    alignSelf: 'flex-start',
  },
});
