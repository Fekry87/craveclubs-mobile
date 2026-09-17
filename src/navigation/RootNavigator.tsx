import React, { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen, ClubEntryScreen } from '../screens/Auth';
import { ForceUpdateScreen } from '../screens/Auth/ForceUpdateScreen';
import { SportSelectScreen } from '../screens/SportSelect';
import { AppNavigator } from './AppNavigator';
import { CoachAppNavigator } from './CoachAppNavigator';
import { ManagerAppNavigator } from './ManagerAppNavigator';
import { RegistrationNavigator } from './RegistrationNavigator';
import { NotificationCenterScreen } from '../screens/Notifications';
import { ChangePasswordScreen, SetPasswordScreen } from '../screens/Profile';
import { EvaluationsScreen } from '../screens/Progress';
import { SessionDetailScreen } from '../screens/Sessions';
import { useAuthStore } from '../store/auth.store';
import { useBrandingStore } from '../store/branding.store';
import { useSportModuleStore } from '../store/sportModule.store';
import { useNotificationStore } from '../store/notification.store';
import { setOnUnauthorized } from '../api/client';
// Note: store functions are accessed via getState() to avoid dependency instability
import { checkAppVersion, VersionCheckResponse } from '../api/services/app.service';
import { getPlatformBranding, PlatformBranding } from '../api/services/platform.service';
import { registerForPushNotifications } from '../services/pushNotifications';
import { SplashScreen } from '../components/common/SplashScreen';
import { RootStackParamList } from './types';
import { colors, fontFamily } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Authenticated screen wrapper — checks user role and renders
 * the appropriate navigator (Coach or Swimmer).
 */
const AuthenticatedNavigator: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  if (user?.role === 'CLUB_MANAGER') {
    return <ManagerAppNavigator />;
  }
  if (user?.role === 'COACH') {
    return <CoachAppNavigator />;
  }
  return <AppNavigator />;
};

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, restoreSession, logout, user } =
    useAuthStore();
  const { isResolved, restoreSlug, refreshBranding } = useBrandingStore();
  const { availableModules, currentModule, fetchAndInitModules } =
    useSportModuleStore();
  const [forceUpdate, setForceUpdate] = useState(false);
  const [storeUrl, setStoreUrl] = useState<VersionCheckResponse['store_url']>(null);
  const [splash, setSplash] = useState<PlatformBranding | null>(null);
  const [splashDone, setSplashDone] = useState(false);

  const needsSportSelect =
    availableModules.length > 1 && !currentModule;

  useEffect(() => {
    // Restore persisted slug for shared builds, then restore auth session + sport modules
    // eslint-disable-next-line -- run once on mount only; store functions are stable singletons
    restoreSlug().then(() => {
      restoreSession();
      fetchAndInitModules();
    });
  }, []);

  // Fetch the launch splash config FIRST, then hold the splash for 3s so the
  // admin-set color/logo is what shows (never a default-color flash).
  useEffect(() => {
    let cancelled = false;
    let holdTimer: ReturnType<typeof setTimeout>;
    getPlatformBranding()
      .then((cfg) => {
        if (!cancelled) setSplash(cfg);
      })
      .catch(() => {
        // Non-critical — splash falls back to defaults
      })
      .finally(() => {
        if (cancelled) return;
        holdTimer = setTimeout(() => {
          if (!cancelled) setSplashDone(true);
        }, 3000);
      });
    return () => {
      cancelled = true;
      clearTimeout(holdTimer);
    };
  }, []);

  // Refresh branding when app returns to foreground
  const appState = useRef(AppState.currentState);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        refreshBranding();
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, []);

  // Version check after auth restore completes
  useEffect(() => {
    if (isLoading) return;
    checkAppVersion()
      .then((result) => {
        if (result.force_update) {
          setStoreUrl(result.store_url ?? null);
          setForceUpdate(true);
        }
      })
      .catch(() => {
        // Version check failure should NOT block the app
      });
  }, [isLoading]);

  useEffect(() => {
    setOnUnauthorized(() => {
      logout();
    });
  }, []);

  // Register push token + fetch notifications after auth
  useEffect(() => {
    if (isAuthenticated) {
      registerForPushNotifications();
      useNotificationStore.getState().fetchNotifications();
    }
  }, [isAuthenticated]);

  if (isLoading || !splashDone) {
    return <SplashScreen config={splash} />;
  }

  if (forceUpdate) {
    return <ForceUpdateScreen storeUrl={storeUrl} />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        // Arrow only. The default back label is the previous route's name, and
        // at the root that name is the internal "App" route — meaningless to a
        // swimmer. An empty headerBackTitle doesn't help: iOS falls back to the
        // previous title anyway.
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      {!isAuthenticated && !isResolved ? (
        /* Shared build with no club chosen yet — name the club before login */
        <Stack.Screen name="ClubEntry" component={ClubEntryScreen} />
      ) : isAuthenticated && user?.must_change_password ? (
        /* Signed in with a password the club handed out — set their own first.
           Nothing else in the app is reachable until the store lifts the flag. */
        <Stack.Screen name="SetPassword" component={SetPasswordScreen} />
      ) : isAuthenticated && needsSportSelect ? (
        /* Multi-sport club — user must pick a sport module first */
        <Stack.Screen name="SportSelect" component={SportSelectScreen} />
      ) : isAuthenticated ? (
        <Stack.Screen name="App" component={AuthenticatedNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={LoginScreen} />
      )}
      {/* Notification center — accessible when authenticated */}
      <Stack.Screen
        name="NotificationCenter"
        component={NotificationCenterScreen}
        options={{
          headerShown: true,
          title: 'Notifications',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleStyle: {
            fontFamily: fontFamily.headingBold,
            color: colors.text,
            fontSize: 18,
          },
          headerShadowVisible: false,
        }}
      />
      {/* Change password — from Profile */}
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{
          headerShown: true,
          title: 'Change password',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleStyle: {
            fontFamily: fontFamily.headingBold,
            color: colors.text,
            fontSize: 18,
          },
          headerShadowVisible: false,
        }}
      />
      {/* Session detail — from a session card on Home or the Sessions tab */}
      <Stack.Screen
        name="SessionDetail"
        component={SessionDetailScreen}
        options={{
          headerShown: true,
          title: 'Session',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleStyle: {
            fontFamily: fontFamily.headingBold,
            color: colors.text,
            fontSize: 18,
          },
          headerShadowVisible: false,
        }}
      />
      {/* Evaluations — full screen from Home "See All" */}
      <Stack.Screen
        name="Evaluations"
        component={EvaluationsScreen}
        options={{
          headerShown: true,
          title: 'All Evaluations',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleStyle: {
            fontFamily: fontFamily.headingBold,
            color: colors.text,
            fontSize: 18,
          },
          headerShadowVisible: false,
        }}
      />
      {/* Registration is accessible from both auth & unauth states */}
      <Stack.Screen name="Registration" component={RegistrationNavigator} />
    </Stack.Navigator>
  );
};
