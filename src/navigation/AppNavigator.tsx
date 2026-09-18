import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/Home';
import { SessionsScreen } from '../screens/Sessions';
import { PlanAndReportScreen } from '../screens/TrainingPlan';
import { ProgressNavigator } from './ProgressNavigator';
import { LeaderboardScreen } from '../screens/Leaderboard';
import { Icon, IconName } from '../components/common/Icon';
import { NotificationBell } from '../components/common/NotificationBell';
import { ProfileButton } from '../components/common/ProfileButton';
import { GlassTabBar } from '../components/common/GlassTabBar';
import { useAuthStore } from '../store/auth.store';
import { useProfileStore } from '../store/profile.store';
import { useTrainingPlanStore } from '../store/trainingPlan.store';
import { useSportModuleStore } from '../store/sportModule.store';
import { useRealtime } from '../hooks/useRealtime';
import { useSessionStore } from '../store/session.store';
import { isEchoConnected } from '../services/echo.service';
// Note: polling uses getState() to avoid useEffect dependency loops
import { AppTabParamList } from './types';
import { colors, spacing, fontFamily, borderRadius } from '../theme';

const Tab = createBottomTabNavigator<AppTabParamList>();

/* ═══════════════════════════════════════════════════
   Tab Icon Config — swimmer tabs
   ═══════════════════════════════════════════════════ */

interface TabIconConfig {
  filledIcon: IconName;
  outlineIcon: IconName;
}

const TAB_ICONS: Record<string, TabIconConfig> = {
  Home: {
    filledIcon: 'home-4-fill',
    outlineIcon: 'home-4-line',
  },
  Sessions: {
    filledIcon: 'calendar-event-fill',
    outlineIcon: 'calendar-event-line',
  },
  MyPlan: {
    filledIcon: 'clipboard-fill',
    outlineIcon: 'clipboard-line',
  },
  Progress: {
    filledIcon: 'bar-chart-box-fill',
    outlineIcon: 'bar-chart-box-line',
  },
  Leaderboard: {
    filledIcon: 'trophy-fill',
    outlineIcon: 'trophy-line',
  },
  Profile: {
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

/* ── Sport Switcher Chip (header right) ── */
const SportSwitcherChip: React.FC = () => {
  const { currentModule, clearModule } = useSportModuleStore();

  const handleSwitch = useCallback(async () => {
    await clearModule();
  }, [clearModule]);

  if (!currentModule) return null;

  return (
    <TouchableOpacity
      onPress={handleSwitch}
      activeOpacity={0.7}
      style={chipStyles.chip}
    >
      <Icon name="drop-fill" size={14} color={colors.primary} />
      <Text style={chipStyles.chipText} numberOfLines={1}>
        {currentModule.name}
      </Text>
      <Icon name="refresh-line" size={14} color={colors.textMuted} />
    </TouchableOpacity>
  );
};

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryDim,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    marginRight: spacing.sm,
  },
  chipText: {
    fontSize: 12,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.primary,
    maxWidth: 100,
  },
});

export const AppNavigator: React.FC = () => {
  const { user } = useAuthStore();
  const hasLeaderboard = user?.features?.leaderboard_enabled ?? false;
  const hasTrainingPlans = user?.features?.training_plans_enabled ?? false;
  const hasNewPlan = useTrainingPlanStore((s) => s.hasNewPlan);
  const { availableModules, currentModule } = useSportModuleStore();
  const showSwitcher = availableModules.length > 1;

  // Keep WebSocket connection alive across all tabs
  useRealtime();

  // Load the profile once so the header avatar shows the swimmer's photo
  // (Profile is no longer a tab that would fetch it on focus).
  useEffect(() => {
    useProfileStore.getState().fetchProfile();
  }, []);

  // Global session polling fallback — runs every 30s when WebSocket is NOT connected.
  // Ensures session status changes from the portal reflect on ALL tabs without pull-to-refresh.
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPollingRef = useRef(false);

  useEffect(() => {
    // If WebSocket is connected, real-time events handle everything — no polling needed
    if (isEchoConnected()) return;

    pollRef.current = setInterval(async () => {
      // Skip if a previous poll is still in progress
      if (isPollingRef.current) return;
      isPollingRef.current = true;
      try {
        await useSessionStore.getState().refreshSessions();
      } finally {
        isPollingRef.current = false;
      }
    }, 30000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

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
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {showSwitcher && <SportSwitcherChip />}
            <NotificationBell />
            <ProfileButton />
          </View>
        ),
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="Sessions"
        component={SessionsScreen}
        options={{ title: 'Sessions' }}
      />
      {hasLeaderboard && (
        <Tab.Screen
          name="Leaderboard"
          component={LeaderboardScreen}
          options={{ title: 'Awards' }}
        />
      )}
      <Tab.Screen
        name="Progress"
        component={ProgressNavigator}
        options={{ title: 'Progress' }}
      />
      {hasTrainingPlans && (
        <Tab.Screen
          name="MyPlan"
          component={PlanAndReportScreen}
          options={{
            title: 'Plans',
            tabBarBadge: hasNewPlan ? '' : undefined,
            tabBarBadgeStyle: hasNewPlan
              ? {
                  backgroundColor: colors.error,
                  minWidth: 8,
                  maxHeight: 8,
                  borderRadius: 4,
                }
              : undefined,
          }}
        />
      )}
    </Tab.Navigator>
  );
};

