// Root App Navigator — Auth flow + Main tabs

import React, { useRef, useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigationContainerRef } from '@react-navigation/native';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import HospitalFinderScreen from '../screens/HospitalFinderScreen';
import EmergencyScreen from '../screens/EmergencyScreen';
import MainTabNavigator from './MainTabNavigator';
import { useAppStore } from '../store/useAppStore';
import { RootStackParamList } from '../types';
import { trackScreenView } from '../services/analytics';
import { setUserContext } from '../services/errorTracking';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isAuthenticated, hasSeenOnboarding, user } = useAppStore();
  const currentRoute = useRef<string | undefined>(undefined);

  // Set user context for error tracking when authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      setUserContext({ id: user.id, email: user.email });
    } else {
      setUserContext(null);
    }
  }, [isAuthenticated, user]);

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      screenListeners={{
        state: (e) => {
          const route = e.data?.state?.routes?.[e.data?.state?.index ?? 0];
          if (route && route.name !== currentRoute.current) {
            currentRoute.current = route.name;
            trackScreenView(route.name);
          }
        },
      }}
    >
      {!isAuthenticated ? (
        <>
          {!hasSeenOnboarding && (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          )}
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen
            name="Subscription"
            component={SubscriptionScreen}
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="HospitalFinder"
            component={HospitalFinderScreen}
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="Emergency"
            component={EmergencyScreen}
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
              gestureEnabled: false,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}


