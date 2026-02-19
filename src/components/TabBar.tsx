// Custom Bottom Tab Bar

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows, gradients } from '../theme';

const { width } = Dimensions.get('window');

const TAB_CONFIG = [
  { name: 'Home', icon: 'home', iconOutline: 'home-outline', label: 'Home' },
  { name: 'HealthTools', icon: 'calendar', iconOutline: 'calendar-outline', label: 'Tools' },
  { name: 'Chat', icon: 'chatbubble-ellipses', iconOutline: 'chatbubble-ellipses-outline', label: 'Chat', isCenter: true },
  { name: 'ImageAnalysis', icon: 'image', iconOutline: 'image-outline', label: 'Scan' },
  { name: 'Profile', icon: 'settings', iconOutline: 'settings-outline', label: 'Profile' },
];

export default function TabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {state.routes.map((route: any, index: number) => {
          const config = TAB_CONFIG[index];
          const isFocused = state.index === index;
          const isCenter = config?.isCenter;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (isCenter) {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                activeOpacity={0.8}
                style={styles.centerBtnWrap}
              >
                <LinearGradient
                  colors={[...gradients.teal]}
                  style={styles.centerBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons
                    name={config?.icon as any}
                    size={26}
                    color={colors.white}
                  />
                </LinearGradient>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={styles.tabBtn}
            >
              <Ionicons
                name={(isFocused ? config?.icon : config?.iconOutline) as any}
                size={22}
                color={isFocused ? colors.tabActive : colors.tabInactive}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? colors.tabActive : colors.tabInactive },
                ]}
              >
                {config?.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 20,
    paddingHorizontal: spacing.xl,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 28,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'space-around',
    ...shadows.card,
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  tabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    minWidth: 50,
  },
  tabLabel: {
    ...typography.tabLabel,
    marginTop: 3,
  },
  centerBtnWrap: {
    marginTop: -28,
  },
  centerBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
  },
});
