import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Icon, IconName } from '../../components/common/Icon';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorView } from '../../components/common/ErrorView';
import { NotificationPreferencesSheet } from '../../components/features/notifications/NotificationPreferencesSheet';
import { SubscriptionExpiryModal } from '../../components/features/notifications/SubscriptionExpiryModal';
import { useNotificationStore } from '../../store/notification.store';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import { useAnimatedPress } from '../../hooks/useAnimatedPress';
import { AppNotification } from '../../types/notification.types';
import { RootStackParamList } from '../../types/navigation.types';
import {
  colors,
  spacing,
  fontFamily,
  borderRadius,
  shadows,
} from '../../theme';

/* ═══ Notification type → icon + color mapping ═══ */
const NOTIF_ICON_MAP: Record<string, { icon: IconName; color: string }> = {
  /* ── Swimmer-specific types ── */
  absence_recorded: { icon: 'close-line', color: colors.error },
  subscription_expiring: { icon: 'time-fill', color: colors.orange },
  session_reminder: { icon: 'drop-fill', color: colors.primary },
  plan_assigned: { icon: 'clipboard-fill', color: colors.secondary },
  registration_approved: { icon: 'check-line', color: colors.swimmer },
  repeated_absence: { icon: 'alert-fill', color: colors.error },
  /* ── General types ── */
  session: { icon: 'calendar-event-fill', color: colors.primary },
  attendance: { icon: 'group-fill', color: colors.swimmer },
  absence_alert: { icon: 'alert-fill', color: colors.error },
  evaluation: { icon: 'star-fill', color: colors.warning },
  training_plan: { icon: 'clipboard-fill', color: colors.teal },
  coach_message: { icon: 'mail-fill', color: colors.secondary },
  schedule: { icon: 'time-fill', color: colors.orange },
  info: { icon: 'information-line', color: colors.primary },
  success: { icon: 'check-line', color: colors.success },
  warning: { icon: 'alert-fill', color: colors.warning },
  error: { icon: 'error-warning-fill', color: colors.error },
};

const DEFAULT_VISUAL = { icon: 'notification-3-fill' as IconName, color: colors.textMuted };
const getNotifVisual = (type: string) =>
  NOTIF_ICON_MAP[type] ?? DEFAULT_VISUAL;

/* ═══ Relative time helper ═══ */
const getTimeAgo = (dateStr: string): string => {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

/* ═══ Single Notification Row ═══ */
const NotificationRow: React.FC<{
  item: AppNotification;
  index: number;
  onPress: (item: AppNotification) => void;
}> = React.memo(({ item, index, onPress }) => {
  const animStyle = useAnimatedEntry(Math.min(index, 10));
  const { animatedStyle, onPressIn, onPressOut } = useAnimatedPress();
  const visual = getNotifVisual(item.type);
  const isUnread = !item.read_at;

  return (
    <Animated.View style={[animStyle, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => onPress(item)}
        style={[s.row, isUnread && s.rowUnread]}
      >
        {/* Icon circle */}
        <View
          style={[
            s.iconCircle,
            { backgroundColor: visual.color + '18' },
          ]}
        >
          <Icon name={visual.icon} size={20} color={visual.color} />
        </View>

        {/* Content */}
        <View style={s.rowContent}>
          <Text
            style={[s.rowTitle, isUnread && s.rowTitleUnread]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={s.rowBody} numberOfLines={2}>
            {item.body}
          </Text>
          <Text style={s.rowTime}>{getTimeAgo(item.created_at)}</Text>
        </View>

        {/* Unread dot */}
        {isUnread && <View style={s.unreadDot} />}
      </TouchableOpacity>
    </Animated.View>
  );
});

/* ═══ Main Screen ═══ */
export const NotificationCenterScreen: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    loadMore,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [refreshing, setRefreshing] = React.useState(false);
  const [showPrefs, setShowPrefs] = React.useState(false);
  const [expiryModal, setExpiryModal] = React.useState<{
    visible: boolean;
    daysLeft: number;
  }>({ visible: false, daysLeft: 0 });

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
      // eslint-disable-next-line -- run on focus only, store function is stable
    }, []),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, [fetchNotifications]);

  const handlePress = useCallback(
    (item: AppNotification) => {
      if (!item.read_at) {
        markAsRead(item.id);
      }

      const data = item.data as Record<string, unknown> | null;

      switch (item.type) {
        case 'absence_recorded':
        case 'session_reminder':
          // Navigate to Sessions tab
          navigation.navigate('App', { screen: 'Sessions' });
          break;

        case 'subscription_expiring': {
          const daysLeft =
            typeof data?.days_left === 'number' ? data.days_left : 7;
          setExpiryModal({ visible: true, daysLeft });
          break;
        }

        case 'plan_assigned':
          navigation.navigate('App', { screen: 'MyPlan' });
          break;

        case 'registration_approved':
          navigation.navigate('App', { screen: 'Home' });
          break;

        default:
          // Stay on screen — already marked as read above
          break;
      }
    },
    [markAsRead, navigation],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: AppNotification; index: number }) => (
      <NotificationRow item={item} index={index} onPress={handlePress} />
    ),
    [handlePress],
  );

  const keyExtractor = useCallback(
    (item: AppNotification) => item.id.toString(),
    [],
  );

  /* ── Header with Mark All Read + Settings ── */
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={s.headerRightRow}>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllAsRead}
              style={s.headerBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={s.headerBtnText}>Mark all read</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => setShowPrefs(true)}
            style={s.headerSettingsBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="settings-3-line" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, unreadCount, markAllAsRead]);

  /* ── States ── */
  if (isLoading && notifications.length === 0) {
    return <Loader message="Loading notifications…" />;
  }

  if (error && notifications.length === 0) {
    return (
      <ErrorView
        message="Couldn't load notifications"
        onRetry={() => fetchNotifications()}
      />
    );
  }

  if (!isLoading && notifications.length === 0) {
    return (
      <EmptyState
        icon="inbox-line"
        title="No Notifications"
        message="You're all caught up! Notifications will appear here."
      />
    );
  }

  return (
    <View style={s.container}>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      />
      <NotificationPreferencesSheet
        visible={showPrefs}
        onClose={() => setShowPrefs(false)}
      />
      <SubscriptionExpiryModal
        visible={expiryModal.visible}
        daysLeft={expiryModal.daysLeft}
        onClose={() => setExpiryModal({ visible: false, daysLeft: 0 })}
      />
    </View>
  );
};

/* ═══ Styles ═══ */
const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  rowUnread: {
    backgroundColor: colors.primaryDim,
    borderColor: colors.primary + '30',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowContent: {
    flex: 1,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },
  rowTitle: {
    fontSize: 14,
    fontFamily: fontFamily.bodyMedium,
    color: colors.text,
  },
  rowTitleUnread: {
    fontFamily: fontFamily.bodySemiBold,
  },
  rowBody: {
    fontSize: 13,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 18,
  },
  rowTime: {
    fontSize: 11,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textDim,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn: {
    marginRight: spacing.md,
  },
  headerBtnText: {
    fontSize: 13,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.primary,
  },
  headerSettingsBtn: {
    marginRight: spacing.sm,
  },
});
