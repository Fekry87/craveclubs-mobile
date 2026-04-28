import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Animated,
  Modal,
  Dimensions,
  PanResponder,
} from 'react-native';
import { Icon } from '../../common/Icon';
import { storageService } from '../../../services/storage.service';
import {
  colors,
  spacing,
  fontFamily,
  borderRadius,
  shadows,
} from '../../../theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = 420;
const STORAGE_KEY = 'notification_preferences';

interface PreferenceItem {
  key: string;
  label: string;
  description: string;
}

const PREFERENCE_ITEMS: PreferenceItem[] = [
  {
    key: 'session_reminder',
    label: 'Session Reminders',
    description: 'Get notified before upcoming training sessions',
  },
  {
    key: 'absence_alert',
    label: 'Absence Alerts',
    description: 'Notifications about missed sessions',
  },
  {
    key: 'subscription_expiring',
    label: 'Subscription Expiring',
    description: 'Reminder when your subscription is about to expire',
  },
  {
    key: 'general',
    label: 'General Notifications',
    description: 'Club announcements and updates',
  },
];

type Preferences = Record<string, boolean>;

const DEFAULT_PREFS: Preferences = {
  session_reminder: true,
  absence_alert: true,
  subscription_expiring: true,
  general: true,
};

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const NotificationPreferencesSheet: React.FC<Props> = ({
  visible,
  onClose,
}) => {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  // Load saved preferences
  useEffect(() => {
    const load = async () => {
      const saved = await storageService.get(STORAGE_KEY);
      if (saved) {
        try {
          setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(saved) });
        } catch {
          // Invalid data, use defaults
        }
      }
    };
    load();
  }, []);

  // Animate in/out
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SHEET_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        gestureState.dy > 5,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 60) {
          onClose();
        }
      },
    }),
  ).current;

  const togglePref = useCallback(
    async (key: string) => {
      const updated = { ...prefs, [key]: !prefs[key] };
      setPrefs(updated);
      await storageService.set(STORAGE_KEY, JSON.stringify(updated));
    },
    [prefs],
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={s.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            s.sheet,
            { transform: [{ translateY: slideAnim }] },
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity activeOpacity={1}>
            {/* Drag handle */}
            <View style={s.handleRow}>
              <View style={s.handle} />
            </View>

            {/* Header */}
            <View style={s.header}>
              <Icon
                name="settings-3-line"
                size={20}
                color={colors.primary}
              />
              <Text style={s.title}>Notification Preferences</Text>
            </View>

            {/* Toggle items */}
            {PREFERENCE_ITEMS.map((item, index) => (
              <View
                key={item.key}
                style={[
                  s.prefRow,
                  index === PREFERENCE_ITEMS.length - 1 && s.prefRowLast,
                ]}
              >
                <View style={s.prefTextCol}>
                  <Text style={s.prefLabel}>{item.label}</Text>
                  <Text style={s.prefDesc}>{item.description}</Text>
                </View>
                <Switch
                  value={prefs[item.key] ?? true}
                  onValueChange={() => togglePref(item.key)}
                  trackColor={{
                    false: colors.border,
                    true: colors.swimmerDim,
                  }}
                  thumbColor={
                    prefs[item.key] ? colors.swimmer : colors.textDim
                  }
                />
              </View>
            ))}
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.modal,
    borderTopRightRadius: borderRadius.modal,
    paddingBottom: 40,
    ...shadows.lg,
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: 18,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  prefRowLast: {
    borderBottomWidth: 0,
  },
  prefTextCol: {
    flex: 1,
    marginRight: spacing.md,
  },
  prefLabel: {
    fontSize: 15,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
  prefDesc: {
    fontSize: 12,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    marginTop: 2,
  },
});
