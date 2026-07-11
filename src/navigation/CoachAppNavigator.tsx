import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { CoachProfileScreen, SessionCalendarScreen } from '../screens/Coach';
import { CoachSessionsNavigator } from './CoachSessionsNavigator';
import { Icon, IconName } from '../components/common/Icon';
import { NotificationBell } from '../components/common/NotificationBell';
import { useAuthStore } from '../store/auth.store';
import { CoachTabParamList } from './types';
import { colors, fontFamily, shadows } from '../theme';

/* Screens where the bottom tab bar should be hidden */
const HIDE_TAB_BAR_SCREENS = [
  'CoachSessionDetail',
  'CoachSessionLive',
  'CoachCreateSession',
  'CoachSessionAttendance',
];

const Tab = createBottomTabNavigator<CoachTabParamList>();

/* ═══════════════════════════════════════════════════
   Tab Icon Config — same soft glow pattern as swimmer
   2 tabs: Sessions (primary) + Profile
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
  CoachSessions: {
    filledIcon: 'calendar-event-fill',
    outlineIcon: 'calendar-event-line',
    color: colors.primary,
    glowColor: colors.primaryDim,
    shadowColor: colors.primary,
  },
  CoachCalendar: {
    filledIcon: 'calendar-event-fill',
    outlineIcon: 'calendar-event-line',
    color: colors.teal,
    glowColor: colors.tealDim,
    shadowColor: colors.teal,
  },
  CoachProfile: {
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
  CoachSessions: colors.primary,
  CoachCalendar: colors.teal,
  CoachProfile: colors.secondary,
});

export const CoachAppNavigator: React.FC = () => {
  useAuthStore();

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
        name="CoachSessions"
        component={CoachSessionsNavigator}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route);
          const hideTabBar = routeName && HIDE_TAB_BAR_SCREENS.includes(routeName);
          return {
            title: 'Sessions',
            headerShown: false,
            tabBarStyle: hideTabBar
              ? { display: 'none' as const }
              : {
                  backgroundColor: colors.white,
                  borderTopWidth: 0,
                  height: 88,
                  paddingBottom: 26,
                  paddingTop: 8,
                  ...shadows.md,
                },
          };
        }}
      />
      <Tab.Screen
        name="CoachCalendar"
        component={SessionCalendarScreen}
        options={{ title: 'Schedule', headerShown: false }}
      />
      <Tab.Screen
        name="CoachProfile"
        component={CoachProfileScreen}
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
