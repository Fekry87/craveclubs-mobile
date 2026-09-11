import React from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { CoachProfileScreen, SessionCalendarScreen } from '../screens/Coach';
import { CoachSessionsNavigator } from './CoachSessionsNavigator';
import { Icon, IconName } from '../components/common/Icon';
import { NotificationBell } from '../components/common/NotificationBell';
import { useAuthStore } from '../store/auth.store';
import { CoachTabParamList } from './types';
import { colors, fontFamily } from '../theme';

/* Screens where the bottom tab bar should be hidden */
const HIDE_TAB_BAR_SCREENS = [
  'CoachSessionDetail',
  'CoachSessionLive',
  'CoachCreateSession',
  'CoachSessionAttendance',
];

const Tab = createBottomTabNavigator<CoachTabParamList>();

/* ═══════════════════════════════════════════════════
   Tab Icon Config — coach tabs
   ═══════════════════════════════════════════════════ */

interface TabIconConfig {
  filledIcon: IconName;
  outlineIcon: IconName;
}

const TAB_ICONS: Record<string, TabIconConfig> = {
  CoachSessions: {
    filledIcon: 'calendar-event-fill',
    outlineIcon: 'calendar-event-line',
  },
  CoachCalendar: {
    filledIcon: 'calendar-event-fill',
    outlineIcon: 'calendar-event-line',
  },
  CoachProfile: {
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

export const CoachAppNavigator: React.FC = () => {
  useAuthStore();

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
                  borderTopWidth: 1,
                  borderTopColor: colors.borderLight,
                  height: 88,
                  paddingBottom: 28,
                  paddingTop: 10,
                  elevation: 0,
                  shadowOpacity: 0,
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

