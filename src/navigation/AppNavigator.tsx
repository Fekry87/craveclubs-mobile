import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/Home';
import { SessionsScreen } from '../screens/Sessions';
import { PlanAndReportScreen } from '../screens/TrainingPlan';
import { ProgressNavigator } from './ProgressNavigator';
import { LeaderboardScreen } from '../screens/Leaderboard';
import { ProfileScreen } from '../screens/Profile';
import { Icon, IconName } from '../components/common/Icon';
import { NotificationBell } from '../components/common/NotificationBell';
import { useAuthStore } from '../store/auth.store';
import { useTrainingPlanStore } from '../store/trainingPlan.store';
import { useSportModuleStore } from '../store/sportModule.store';
import { useRealtime } from '../hooks/useRealtime';
import { useSessionStore } from '../store/session.store';
import { isEchoConnected } from '../services/echo.service';
// Note: polling uses getState() to avoid useEffect dependency loops
import { AppTabParamList } from './types';
import { colors, spacing, fontFamily, shadows, borderRadius } from '../theme';

const Tab = createBottomTabNavigator<AppTabParamList>();

/* ═══════════════════════════════════════════════════
   Tab Icon Config
   Each tab has: filled icon, outline icon, accent color,
   and a translucent dim color for the soft glow
   ═══════════════════════════════════════════════════ */

interface TabIconConfig {
  filledIcon: IconName;
  outlineIcon: IconName;
  color: string;
  glowColor: string;
  shadowColor: string;
}

const TAB_ICON_CONFIG: Record<string, TabIconConfig> = {
  Home: {
    filledIcon: 'home-4-fill',
    outlineIcon: 'home-4-line',
    color: '#1CB0F6',
    glowColor: 'rgba(28, 176, 246, 0.13)',
    shadowColor: '#1CB0F6',
  },
  Sessions: {
    filledIcon: 'calendar-event-fill',
    outlineIcon: 'calendar-event-line',
    color: '#FF9600',
    glowColor: 'rgba(255, 150, 0, 0.13)',
    shadowColor: '#FF9600',
  },
  MyPlan: {
    filledIcon: 'clipboard-fill',
    outlineIcon: 'clipboard-line',
    color: '#2DD4BF',
    glowColor: 'rgba(45, 212, 191, 0.13)',
    shadowColor: '#2DD4BF',
  },
  Progress: {
    filledIcon: 'bar-chart-box-fill',
    outlineIcon: 'bar-chart-box-line',
    color: '#58CC02',
    glowColor: 'rgba(88, 204, 2, 0.13)',
    shadowColor: '#58CC02',
  },
  Leaderboard: {
    filledIcon: 'trophy-fill',
    outlineIcon: 'trophy-line',
    color: '#FFC800',
    glowColor: 'rgba(255, 200, 0, 0.15)',
    shadowColor: '#FFC800',
  },
  Profile: {
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
      {/* Soft glow pill behind the icon */}
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
  Home: '#1CB0F6',
  Sessions: '#FF9600',
  MyPlan: '#2DD4BF',
  Progress: '#58CC02',
  Leaderboard: '#FFC800',
  Profile: '#CE82FF',
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
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {showSwitcher && <SportSwitcherChip />}
            <NotificationBell />
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
      {hasTrainingPlans && (
        <Tab.Screen
          name="MyPlan"
          component={PlanAndReportScreen}
          options={{
            title: 'My Plan',
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
      <Tab.Screen
        name="Progress"
        component={ProgressNavigator}
        options={{ title: 'Progress' }}
      />
      {hasLeaderboard && (
        <Tab.Screen
          name="Leaderboard"
          component={LeaderboardScreen}
          options={{ title: 'Leaderboard' }}
        />
      )}
      <Tab.Screen
        name="Profile"
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
  /* Soft pill glow behind active icon — no hard edges */
  glowPill: {
    position: 'absolute',
    width: 48,
    height: 32,
    borderRadius: 999,
    ...shadows.glow,
  },
});
