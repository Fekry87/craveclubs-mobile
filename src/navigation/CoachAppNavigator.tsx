import React from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { CoachProfileScreen, SessionCalendarScreen } from '../screens/Coach';
import { CoachSessionsNavigator } from './CoachSessionsNavigator';
import { Icon, IconName } from '../components/common/Icon';
import { NotificationBell } from '../components/common/NotificationBell';
import { GlassTabBar } from '../components/common/GlassTabBar';
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
  const { t } = useTranslation('nav');

  return (
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon routeName={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textDim,
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
            title: t('tabs.sessions'),
            headerShown: false,
            // Hide the floating bar on deep screens (detail/live/attendance).
            tabBarStyle: hideTabBar ? { display: 'none' as const } : undefined,
          };
        }}
      />
      <Tab.Screen
        name="CoachCalendar"
        component={SessionCalendarScreen}
        options={{ title: t('tabs.schedule'), headerShown: false }}
      />
      <Tab.Screen
        name="CoachProfile"
        component={CoachProfileScreen}
        options={{ title: t('tabs.profile') }}
      />
    </Tab.Navigator>
  );
};

