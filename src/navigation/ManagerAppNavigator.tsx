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

const TAB_ICON_CONFIG: Record<string, TabIconConfig> = {
  ManagerAnalytics: {
    filledIcon: 'bar-chart-box-fill',
    outlineIcon: 'bar-chart-box-line',
    color: '#1CB0F6',
    glowColor: 'rgba(28, 176, 246, 0.13)',
    shadowColor: '#1CB0F6',
  },
  ManagerCoaches: {
    filledIcon: 'team-fill',
    outlineIcon: 'team-line',
    color: '#58CC02',
    glowColor: 'rgba(88, 204, 2, 0.13)',
    shadowColor: '#58CC02',
  },
  ManagerProfile: {
    filledIcon: 'user-fill',
    outlineIcon: 'user-line',
    color: '#CE82FF',
    glowColor: 'rgba(206, 130, 255, 0.13)',
    shadowColor: '#CE82FF',
  },
};

/* ── Soft Glow Tab Icon ── */
const TabIcon: React.FC<{ routeName: string; focused: boolean }> = ({
  routeName,
  focused,
}) => {
  const config = TAB_ICON_CONFIG[routeName];
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

/* ── Tab color map for labels ── */
const TAB_COLORS: Record<string, string> = {
  ManagerAnalytics: '#1CB0F6',
  ManagerCoaches: '#58CC02',
  ManagerProfile: '#CE82FF',
};

export const ManagerAppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon routeName={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: TAB_COLORS[route.name] ?? colors.primary,
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
