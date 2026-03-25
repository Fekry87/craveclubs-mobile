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
import { EvaluationsScreen } from '../screens/Progress';
import { useAuthStore } from '../store/auth.store';
import { useBrandingStore } from '../store/branding.store';
import { useSportModuleStore } from '../store/sportModule.store';
import { useNotificationStore } from '../store/notification.store';
import { setOnUnauthorized } from '../api/client';
import { checkAppVersion, VersionCheckResponse } from '../api/services/app.service';
import { registerForPushNotifications } from '../services/pushNotifications';
import { Loader } from '../components/common/Loader';
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
  const [updateUrl, setUpdateUrl] = useState<VersionCheckResponse['update_url']>({ ios: '', android: '' });

  const needsSportSelect =
    availableModules.length > 1 && !currentModule;

  useEffect(() => {
    // Restore persisted slug for shared builds, then restore auth session + sport modules
    restoreSlug().then(() => {
      restoreSession();
      fetchAndInitModules();
    });
  }, [restoreSlug, restoreSession, fetchAndInitModules]);

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
  }, [refreshBranding]);

  // Version check after auth restore completes
  useEffect(() => {
    if (isLoading) return;
    checkAppVersion()
      .then((result) => {
        if (result.force_update) {
          setUpdateUrl(result.update_url);
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
  }, [logout]);

  // Register push token + fetch notifications after auth
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  useEffect(() => {
    if (isAuthenticated) {
      registerForPushNotifications();
      fetchNotifications();
    }
  }, [isAuthenticated, fetchNotifications]);

  if (isLoading) {
    return <Loader message="Loading..." />;
  }

  if (forceUpdate) {
    return <ForceUpdateScreen updateUrl={updateUrl} />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated && needsSportSelect ? (
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
            backgroundColor: colors.white,
          },
          headerTitleStyle: {
            fontFamily: fontFamily.headingBold,
            color: colors.text,
            fontSize: 20,
          },
          headerShadowVisible: false,
          headerBackTitle: '',
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
            backgroundColor: colors.white,
          },
          headerTitleStyle: {
            fontFamily: fontFamily.headingBold,
            color: colors.text,
            fontSize: 20,
          },
          headerShadowVisible: false,
          headerBackTitle: '',
        }}
      />
      {/* Registration is accessible from both auth & unauth states */}
      <Stack.Screen name="Registration" component={RegistrationNavigator} />
    </Stack.Navigator>
  );
};
