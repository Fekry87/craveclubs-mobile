import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  StyleSheet,
  Animated,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { Loader } from '../../components/common/Loader';
import { ErrorView } from '../../components/common/ErrorView';
import { StarRating } from '../../components/features/coach/StarRating';
import { useCoachStore } from '../../store/coach.store';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import { formatTimeRange, getRelativeDate } from '../../utils/formatters';
import { CoachSessionsStackParamList } from '../../navigation/types';
import { colors, spacing, fontFamily, borderRadius, shadows } from '../../theme';

type Props = NativeStackScreenProps<CoachSessionsStackParamList, 'CoachSessionDetail'>;

const STATUS_COLORS: Record<string, string> = {
  Scheduled: colors.primary,
  Live: colors.warning,
  Completed: colors.swimmer,
  Cancelled: colors.error,
};

export const CoachSessionDetailScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { sessionId } = route.params;
  const {
    selectedSession,
    isDetailLoading,
    detailError,
    fetchSessionDetail,
    startSession,
    completeSession,
    clearSelected,
  } = useCoachStore();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const headerEntry = useAnimatedEntry(0);
  const notesEntry = useAnimatedEntry(1);
  const ratingEntry = useAnimatedEntry(2);
  const rosterEntry = useAnimatedEntry(3);
  const actionsEntry = useAnimatedEntry(4);

  useEffect(() => {
    fetchSessionDetail(sessionId);
    return () => {
      clearSelected();
    };
  }, [sessionId, fetchSessionDetail, clearSelected]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSessionDetail(sessionId);
    setRefreshing(false);
  }, [fetchSessionDetail, sessionId]);

  const handleStartSession = useCallback(() => {
    Alert.alert(
      'Start Session',
      'Are you sure you want to start this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: async () => {
            await startSession(sessionId);
            navigation.navigate('CoachSessionLive', { sessionId });
          },
        },
      ],
    );
  }, [startSession, sessionId, navigation]);

  const handleManageSession = useCallback(() => {
    navigation.navigate('CoachSessionLive', { sessionId });
  }, [navigation, sessionId]);

  if (isDetailLoading && !selectedSession) {
    return <Loader message="Loading session details..." />;
  }

  if (detailError && !selectedSession) {
    return (
      <ErrorView
        message={detailError}
        onRetry={() => fetchSessionDetail(sessionId)}
      />
    );
  }

  if (!selectedSession) {
    return <Loader message="Loading session details..." />;
  }

  const session = selectedSession;
  const statusColor = STATUS_COLORS[session.status] ?? colors.primary;
  const roster = session.effective_roster ?? [];

  return (
    <View style={s.flex}>
      <ScrollView
        style={s.container}
        contentContainerStyle={s.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Session Header Card */}
        <Animated.View style={headerEntry}>
          <Card style={s.card}>
            {/* Title + Status */}
            <View style={s.titleRow}>
              <Text style={s.sessionTitle} numberOfLines={2}>
                {session.title || session.type}
              </Text>
              <View
                style={[
                  s.statusBadge,
                  { backgroundColor: statusColor },
                ]}
              >
                <Text
                  style={[
                    s.statusText,
                    {
                      color:
                        session.status === 'Live'
                          ? colors.text
                          : colors.white,
                    },
                  ]}
                >
                  {session.status}
                </Text>
              </View>
            </View>

            {/* Type badge */}
            <View style={s.typeBadge}>
              <Text style={s.typeBadgeText}>{session.type}</Text>
            </View>

            {/* Meta info */}
            <View style={s.metaSection}>
              {/* Date + Time */}
              <View style={s.metaRow}>
                <View style={s.metaIconCircle}>
                  <Icon name="calendar-event-line" size={16} color={colors.primary} />
                </View>
                <Text style={s.metaText}>
                  {getRelativeDate(session.date)} {'\u00B7'}{' '}
                  {formatTimeRange(session.start_time, session.end_time)}
                </Text>
              </View>

              {/* Group */}
              <View style={s.metaRow}>
                <View style={s.metaIconCircle}>
                  <Icon name="group-line" size={16} color={colors.primary} />
                </View>
                <Text style={s.metaText}>
                  {session.group?.name ?? 'Unknown Group'}
                </Text>
              </View>

              {/* Location */}
              {session.location && (
                <View style={s.metaRow}>
                  <View style={s.metaIconCircle}>
                    <Icon name="map-pin-line" size={16} color={colors.primary} />
                  </View>
                  <Text style={s.metaText}>{session.location}</Text>
                </View>
              )}

              {/* Notes */}
              {session.notes && (
                <View style={s.metaRow}>
                  <View style={s.metaIconCircle}>
                    <Icon name="file-list-line" size={16} color={colors.primary} />
                  </View>
                  <Text style={s.metaText}>{session.notes}</Text>
                </View>
              )}
            </View>
          </Card>
        </Animated.View>

        {/* Session Notes (completed) */}
        {session.status === 'Completed' && session.summary_notes && (
          <Animated.View style={notesEntry}>
            <Text style={s.sectionTitle}>Session Notes</Text>
            <Card style={s.card}>
              <View style={s.notesContent}>
                <View style={s.notesIconCircle}>
                  <Icon name="file-list-fill" size={18} color={colors.secondary} />
                </View>
                <Text style={s.notesText}>{session.summary_notes}</Text>
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Group Rating (completed) */}
        {session.status === 'Completed' && session.group_evaluation && (
          <Animated.View style={ratingEntry}>
            <Text style={s.sectionTitle}>Group Rating</Text>
            <Card style={s.card}>
              <View style={s.ratingContent}>
                <View style={s.ratingIconCircle}>
                  <Icon name="star-fill" size={20} color={colors.warning} />
                </View>
                <View style={s.ratingInfo}>
                  <StarRating
                    rating={session.group_evaluation.rating}
                    readonly
                    size={24}
                  />
                  {session.group_evaluation.notes && (
                    <Text style={s.ratingNotes}>
                      {session.group_evaluation.notes}
                    </Text>
                  )}
                </View>
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Swimmers Roster */}
        {roster.length > 0 && (
          <Animated.View style={rosterEntry}>
            <View style={s.rosterHeader}>
              <Text style={s.sectionTitle}>
                Swimmers
              </Text>
              <View style={s.rosterCountBadge}>
                <Text style={s.rosterCountText}>{roster.length}</Text>
              </View>
            </View>
            <Card style={s.card}>
              {roster.map((swimmer, index) => {
                const isLast = index === roster.length - 1;
                const attendance = session.attendances?.find(
                  (a) => a.swimmer_id === swimmer.id,
                );
                const isCompleted = session.status === 'Completed';

                return (
                  <View
                    key={swimmer.id}
                    style={[
                      s.swimmerRow,
                      !isLast && s.swimmerRowBorder,
                    ]}
                  >
                    {/* Avatar circle */}
                    <View style={s.swimmerAvatar}>
                      <Text style={s.swimmerInitials}>
                        {swimmer.first_name.charAt(0)}
                        {swimmer.last_name.charAt(0)}
                      </Text>
                    </View>

                    {/* Name + level */}
                    <View style={s.swimmerInfo}>
                      <Text style={s.swimmerName}>
                        {swimmer.first_name} {swimmer.last_name}
                      </Text>
                      {swimmer.level && (
                        <View style={s.levelBadge}>
                          <Text style={s.levelText}>{swimmer.level}</Text>
                        </View>
                      )}
                    </View>

                    {/* Attendance indicator */}
                    {isCompleted && attendance && (
                      <View
                        style={[
                          s.attendanceBadge,
                          {
                            backgroundColor: attendance.present
                              ? colors.successDim
                              : colors.errorDim,
                          },
                        ]}
                      >
                        <Icon
                          name={
                            attendance.present
                              ? 'checkbox-circle-fill'
                              : 'close-circle-fill'
                          }
                          size={14}
                          color={
                            attendance.present
                              ? colors.swimmer
                              : colors.error
                          }
                        />
                        <Text
                          style={[
                            s.attendanceText,
                            {
                              color: attendance.present
                                ? colors.swimmer
                                : colors.error,
                            },
                          ]}
                        >
                          {attendance.present ? 'Present' : 'Absent'}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </Card>
          </Animated.View>
        )}

      </ScrollView>

      {/* Sticky Action Buttons */}
      {session.status === 'Scheduled' && (
        <Animated.View style={[s.stickyFooter, { paddingBottom: Math.max(spacing.sm, insets.bottom) }, actionsEntry]}>
          <Button
            variant="primary"
            title="Start Session"
            onPress={handleStartSession}
          />
        </Animated.View>
      )}
      {session.status === 'Live' && (
        <Animated.View style={[s.stickyFooter, { paddingBottom: Math.max(spacing.sm, insets.bottom) }, actionsEntry]}>
          <Button
            variant="blue"
            title="Manage Session"
            onPress={handleManageSession}
          />
        </Animated.View>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },

  /* Card */
  card: {
    marginBottom: spacing.md,
  },

  /* Header */
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  sessionTitle: {
    flex: 1,
    fontSize: 22,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
  },
  statusText: {
    fontSize: 11,
    fontFamily: fontFamily.bodySemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  /* Type badge */
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryDim,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    marginTop: spacing.sm,
  },
  typeBadgeText: {
    fontSize: 12,
    fontFamily: fontFamily.bodyMedium,
    color: colors.primary,
  },

  /* Meta */
  metaSection: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  metaIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    lineHeight: 20,
    marginTop: spacing.xs + 2,
  },

  /* Section title */
  sectionTitle: {
    fontSize: 18,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },

  /* Notes */
  notesContent: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  notesIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondaryDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fontFamily.bodyRegular,
    color: colors.text,
    lineHeight: 22,
  },

  /* Rating */
  ratingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  ratingIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.warningDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingInfo: {
    flex: 1,
  },
  ratingNotes: {
    fontSize: 13,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: spacing.xs,
  },

  /* Roster header */
  rosterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  rosterCountBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryDim,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs + 2,
  },
  rosterCountText: {
    fontSize: 12,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.primary,
  },

  /* Swimmers */
  swimmerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
  },
  swimmerRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  swimmerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swimmerInitials: {
    fontSize: 13,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.primary,
  },
  swimmerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  swimmerName: {
    fontSize: 14,
    fontFamily: fontFamily.bodyMedium,
    color: colors.text,
  },
  levelBadge: {
    backgroundColor: colors.swimmerDim,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  levelText: {
    fontSize: 11,
    fontFamily: fontFamily.bodyMedium,
    color: colors.swimmer,
  },

  /* Attendance indicator */
  attendanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
  },
  attendanceText: {
    fontSize: 12,
    fontFamily: fontFamily.bodySemiBold,
  },

  /* Sticky footer */
  stickyFooter: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
