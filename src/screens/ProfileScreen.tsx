// Profile Screen

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../components/GradientBackground';
import Card from '../components/Card';
import GradientButton from '../components/GradientButton';
import { colors, spacing, typography, borderRadius, shadows, gradients } from '../theme';
import { useAppStore } from '../store/useAppStore';

const { width } = Dimensions.get('window');

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  iconColor: string;
  onPress: () => void;
  rightElement?: React.ReactNode;
}

function MenuItem({ icon, label, iconColor, onPress, rightElement }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, { backgroundColor: iconColor + '18' }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <View style={styles.menuRight}>
        {rightElement || <Ionicons name="chevron-forward" size={18} color={colors.textLight} />}
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ navigation }: any) {
  const { user, language, setLanguage, logout } = useAppStore();
  const [showSubscription, setShowSubscription] = useState(false);

  const handleLogout = () => {
    logout();
    // Navigation handled automatically by conditional rendering in AppNavigator
  };

  return (
    <GradientBackground>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{language === 'my' ? 'ကိုယ်ရေးအချက်အလက်' : 'My Profile'}</Text>
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={32} color={colors.teal} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'User'}</Text>
              <Text style={styles.profileEmail}>@{user?.email?.split('@')[0] || 'user'}</Text>
            </View>
          </View>
          <GradientButton
            title={language === 'my' ? 'ပြင်ဆင်ရန်' : 'Edit Profile'}
            onPress={() => {}}
            size="small"
            gradient={[...gradients.teal]}
            style={styles.editBtn}
          />
        </Card>

        {/* Menu Items */}
        <Card style={styles.menuCard}>
          <MenuItem
            icon="person"
            label={language === 'my' ? 'ကိုယ်ရေးအသေးစိတ်' : 'Profile details'}
            iconColor={colors.teal}
            onPress={() => {}}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="lock-closed"
            label={language === 'my' ? 'စကားဝှက်' : 'Passwords'}
            iconColor={colors.accentGradientStart}
            onPress={() => {}}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="globe"
            label={language === 'my' ? 'ဘာသာစကား' : 'Language'}
            iconColor={colors.teal}
            onPress={() => setLanguage(language === 'en' ? 'my' : 'en')}
            rightElement={
              <View style={styles.langToggle}>
                <Text style={styles.langText}>
                  {language === 'en' ? 'English' : 'မြန်မာ'}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
              </View>
            }
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="diamond"
            label={language === 'my' ? 'အခြေအနေ' : 'Subscription'}
            iconColor="#FDCB6E"
            onPress={() => navigation.navigate('Subscription')}
          />
        </Card>

        <Card style={styles.menuCard}>
          <MenuItem
            icon="information-circle"
            label={language === 'my' ? 'အကြောင်း' : 'About'}
            iconColor={colors.info}
            onPress={() => {}}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="help-circle"
            label={language === 'my' ? 'အကူအညီ' : 'Help / FAQ'}
            iconColor={colors.success}
            onPress={() => {}}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="log-out"
            label={language === 'my' ? 'ထွက်ရန်' : 'Log out'}
            iconColor={colors.error}
            onPress={handleLogout}
          />
        </Card>

        {/* App version */}
        <Text style={styles.version}>MediAI v1.0.0</Text>

        <View style={{ height: 120 }} />
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 40 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 68,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  backBtn: {},
  headerTitle: {
    ...typography.h2,
    paddingTop: 6,
  },

  // Profile card
  profileCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    ...typography.h3,
    paddingTop: 0,
  },
  profileEmail: {
    ...typography.bodySmall,
    paddingTop: 0,
  },
  editBtn: {
    alignSelf: 'center',
  },

  // Menu
  menuCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    padding: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  menuLabel: {
    ...typography.body,
    flex: 1,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xl,
  },
  langToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langText: {
    ...typography.bodySmall,
    marginRight: spacing.xs,
    fontWeight: '500',
  },

  version: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
