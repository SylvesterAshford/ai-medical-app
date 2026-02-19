// Main Tab Navigator — 5 tabs with custom tab bar

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import ImageAnalysisScreen from '../screens/ImageAnalysisScreen';
import HealthToolsScreen from '../screens/HealthToolsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TabBar from '../components/TabBar';
import { MainTabParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="HealthTools" component={HealthToolsScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="ImageAnalysis" component={ImageAnalysisScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
