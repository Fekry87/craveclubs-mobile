import React from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ManagerAnalyticsScreen, ManagerCoachesScreen } from '../screens/Manager';
import { ProfileScreen } from '../screens/Profile';
import { Icon, IconName } from '../components/common/Icon';
import { NotificationBell } from '../components/common/NotificationBell';
import { ManagerTabParamList } from './types';
import { colors, fontFamily } from '../theme';

const Tab = createBottomTabNavigator<ManagerTabParamList>();

/* ═══════════════════════════════════════════════════
   Tab Icon Config — manager tabs
   ═══════════════════════════════════════════════════ */

interface TabIconConfig {
  filledIcon: IconName;
  outlineIcon: IconName;
}

const TAB_ICONS: Record<string, TabIconConfig> = {
  ManagerAnalytics: {
    filledIcon: 'bar-chart-box-fill',
    outlineIcon: 'bar-chart-box-line',
  },
  ManagerCoaches: {
    filledIcon: 'team-fill',
    outlineIcon: 'team-line',
  },
  ManagerProfile: {
    filledIcon: 'user-fill',
    outlineIcon: 'user-line',
  },
};

/* ── Tab Icon — single brand color, no glow ── */
const TabIcon: React.FC<{ routeName: string; focused: boolean }> = ({
  routeName,
  focused,
}) => {
  const config = TAB_ICONS[routeName];
  if (!config) return null;
  return (
    <Icon
      name={focused ? config.filledIcon : config.outlineIcon}
      size={24}
      color={focused ? colors.primary : colors.textDim}
    />
  );
};

export const ManagerAppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon routeName={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textDim,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: fontFamily.bodyMedium,
          marginTop: 4,
        },
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          height: 88,
          paddingBottom: 28,
          paddingTop: 10,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontFamily: fontFamily.headingBold,
          color: colors.text,
          fontSize: 18,
        },
        headerRight: () => <NotificationBell />,
      })}
    >
      <Tab.Screen
        name="ManagerAnalytics"
        component={ManagerAnalyticsScreen}
        options={{ title: 'Analytics', headerShown: false }}
      />
      <Tab.Screen
        name="ManagerCoaches"
        component={ManagerCoachesScreen}
        options={{ title: 'Coaches', headerShown: false }}
      />
      <Tab.Screen
        name="ManagerProfile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

