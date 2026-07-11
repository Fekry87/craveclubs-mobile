import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ManagerAnalyticsScreen, ManagerCoachesScreen } from '../screens/Manager';
import { ProfileScreen } from '../screens/Profile';
import { Icon, IconName } from '../components/common/Icon';
import { NotificationBell } from '../components/common/NotificationBell';
import { ManagerTabParamList } from './types';
import { colors, fontFamily, shadows } from '../theme';

const Tab = createBottomTabNavigator<ManagerTabParamList>();

/* ═══════════════════════════════════════════════════
   Tab Icon Config — manager tabs
   ═══════════════════════════════════════════════════ */

interface TabIconConfig {
  filledIcon: IconName;
  outlineIcon: IconName;
  color: string;
  glowColor: string;
  shadowColor: string;
}

// Resolved at render time so branded colors (mutated in-place by
// applyBrandingColors) are picked up.
const getTabIconConfig = (): Record<string, TabIconConfig> => ({
  ManagerAnalytics: {
    filledIcon: 'bar-chart-box-fill',
    outlineIcon: 'bar-chart-box-line',
    color: colors.primary,
    glowColor: colors.primaryDim,
    shadowColor: colors.primary,
  },
  ManagerCoaches: {
    filledIcon: 'team-fill',
    outlineIcon: 'team-line',
    color: colors.swimmer,
    glowColor: colors.swimmerDim,
    shadowColor: colors.swimmer,
  },
  ManagerProfile: {
    filledIcon: 'user-fill',
    outlineIcon: 'user-line',
    color: colors.secondary,
    glowColor: colors.secondaryDim,
    shadowColor: colors.secondary,
  },
});

/* ── Soft Glow Tab Icon ── */
const TabIcon: React.FC<{ routeName: string; focused: boolean }> = ({
  routeName,
  focused,
}) => {
  const config = getTabIconConfig()[routeName];
  if (!config) return null;

  if (!focused) {
    return (
      <Icon name={config.outlineIcon} size={24} color={colors.textDim} />
    );
  }

  return (
    <View style={t.iconWrap}>
      <View
        style={[
          t.glowPill,
          {
            backgroundColor: config.glowColor,
            shadowColor: config.shadowColor,
          },
        ]}
      />
      <Icon name={config.filledIcon} size={22} color={config.color} />
    </View>
  );
};

/* ── Tab color map for labels (render-time for branding) ── */
const getTabColors = (): Record<string, string> => ({
  ManagerAnalytics: colors.primary,
  ManagerCoaches: colors.swimmer,
  ManagerProfile: colors.secondary,
});

export const ManagerAppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon routeName={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: getTabColors()[route.name] ?? colors.primary,
        tabBarInactiveTintColor: colors.textDim,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: fontFamily.bodySemiBold,
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          height: 88,
          paddingBottom: 26,
          paddingTop: 8,
          ...shadows.md,
        },
        headerStyle: {
          backgroundColor: colors.white,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
        },
        headerTitleStyle: {
          fontFamily: fontFamily.headingBold,
          color: colors.text,
          fontSize: 20,
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

/* ─── Soft glow icon styles ─── */
const t = StyleSheet.create({
  iconWrap: {
    width: 52,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowPill: {
    position: 'absolute',
    width: 48,
    height: 32,
    borderRadius: 999,
    ...shadows.glow,
  },
});
