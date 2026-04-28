import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  Animated,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { ErrorView } from '../../components/common/ErrorView';
import { Icon } from '../../components/common/Icon';
import { StarRating } from '../../components/features/coach/StarRating';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import { useAnimatedPress } from '../../hooks/useAnimatedPress';
import { coachService } from '../../api/services/coach.service';
import { useCoachStore } from '../../store/coach.store';
import { CoachSessionsStackParamList } from '../../navigation/types';
import {
  AttendanceRosterItem,
  SessionAttendanceResponse,
  SessionCompletePayload,
} from '../../types/models.types';
import {
  colors,
  spacing,
  fontFamily,
  borderRadius,
  shadows,
  typography,
} from '../../theme';

type Props = NativeStackScreenProps<
  CoachSessionsStackParamList,
  'CoachSessionAttendance'
>;

// ── Status badge colors ──────────────────────────────────────────────
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Scheduled: { bg: colors.primaryDim, text: colors.primary },
  Live: { bg: colors.orangeDim, text: colors.orange },
  Completed: { bg: colors.successDim, text: colors.success },
  Cancelled: { bg: colors.errorDim, text: colors.error },
};

const formatTime = (time: string) => {
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// ── Swimmer Row Component ─────────────────────────────────────────────
const SwimmerAttendanceRow: React.FC<{
  swimmer: AttendanceRosterItem;
  isPresent: boolean;
  rating: number;
  readOnly: boolean;
  index: number;
  onToggle: (swimmerId: number, present: boolean) => void;
  onRate: (swimmerId: number, rating: number) => void;
}> = React.memo(({ swimmer, isPresent, rating, readOnly, index, onToggle, onRate }) => {
  const entry = useAnimatedEntry(Math.min(index, 10));
  const presentPress = useAnimatedPress();
  const absentPress = useAnimatedPress();

  const initials =
    (swimmer.first_name?.[0] ?? '') + (swimmer.last_name?.[0] ?? '');

  return (
    <Animated.View style={[s.swimmerRow, entry]}>
      {/* Avatar + Name */}
      <View style={s.swimmerInfo}>
        <View
          style={[
            s.avatar,
            {
              backgroundColor: isPresent
                ? colors.swimmerDim
                : colors.errorDim,
            },
          ]}
        >
          <Text
            style={[
              s.avatarText,
              { color: isPresent ? colors.swimmer : colors.error },
            ]}
          >
            {initials.toUpperCase()}
          </Text>
        </View>
        <View style={s.swimmerNameCol}>
          <Text style={s.swimmerName} numberOfLines={1}>
            {swimmer.first_name} {swimmer.last_name}
          </Text>
          {readOnly && (
            <View style={s.readOnlyStatusRow}>
              <Icon
                name={isPresent ? 'checkbox-circle-fill' : 'close-circle-fill'}
                size={14}
                color={isPresent ? colors.swimmer : colors.error}
              />
              <Text
                style={[
                  s.readOnlyStatusText,
                  { color: isPresent ? colors.swimmer : colors.error },
                ]}
              >
                {isPresent ? 'Present' : 'Absent'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Attendance toggles (editable) */}
      {!readOnly && (
        <View style={s.toggleRow}>
          <TouchableOpacity
            onPress={() => onToggle(swimmer.swimmer_id, true)}
            onPressIn={presentPress.onPressIn}
            onPressOut={presentPress.onPressOut}
            activeOpacity={0.7}
          >
            <Animated.View
              style={[
                s.toggleBtn,
                isPresent ? s.toggleBtnActive : s.toggleBtnInactive,
                isPresent && { backgroundColor: colors.swimmerDim, borderColor: colors.swimmer },
                presentPress.animatedStyle,
              ]}
            >
              <Icon
                name="checkbox-circle-fill"
                size={16}
                color={isPresent ? colors.swimmer : colors.textDim}
              />
              <Text
                style={[
                  s.toggleText,
                  { color: isPresent ? colors.swimmer : colors.textDim },
                ]}
              >
                Present
              </Text>
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onToggle(swimmer.swimmer_id, false)}
            onPressIn={absentPress.onPressIn}
            onPressOut={absentPress.onPressOut}
            activeOpacity={0.7}
          >
            <Animated.View
              style={[
                s.toggleBtn,
                !isPresent ? s.toggleBtnActive : s.toggleBtnInactive,
                !isPresent && { backgroundColor: colors.errorDim, borderColor: colors.error },
                absentPress.animatedStyle,
              ]}
            >
              <Icon
                name="close-circle-fill"
                size={16}
                color={!isPresent ? colors.error : colors.textDim}
              />
              <Text
                style={[
                  s.toggleText,
                  { color: !isPresent ? colors.error : colors.textDim },
                ]}
              >
                Absent
              </Text>
            </Animated.View>
          </TouchableOpacity>
        </View>
      )}

      {/* Star rating (only for present swimmers) */}
      {isPresent && (
        <View style={s.ratingRow}>
          <StarRating
            size={readOnly ? 18 : 24}
            rating={rating}
            onRate={readOnly ? undefined : (r) => onRate(swimmer.swimmer_id, r)}
          />
          {rating > 0 && (
            <Text style={s.ratingLabel}>{rating}/5</Text>
          )}
        </View>
      )}
    </Animated.View>
  );
});

// ── Main Screen ──────────────────────────────────────────────────────
export const CoachSessionAttendanceScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { sessionId } = route.params;
  const { startSession } = useCoachStore();

  // State
  const [data, setData] = useState<SessionAttendanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendanceMap, setAttendanceMap] = useState<Record<number, boolean>>({});
  const [ratingsMap, setRatingsMap] = useState<Record<number, number>>({});
  const [summaryNotes, setSummaryNotes] = useState('');
  const [groupRating, setGroupRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // Animation hooks (top level)
  const headerEntry = useAnimatedEntry(0);
  const summaryEntry = useAnimatedEntry(1);
  const rosterEntry = useAnimatedEntry(2);
  const notesEntry = useAnimatedEntry(3);

  // Fetch attendance data
  const fetchAttendance = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await coachService.getSessionAttendance(sessionId);
      setData(response);

      // Initialize attendance map from roster
      const initAttendance: Record<number, boolean> = {};
      const initRatings: Record<number, number> = {};
      response.roster.forEach((item) => {
        initAttendance[item.swimmer_id] = item.present;
        if (item.rating !== null) {
          initRatings[item.swimmer_id] = item.rating;
        }
      });
      setAttendanceMap(initAttendance);
      setRatingsMap(initRatings);
    } catch {
      setError('Failed to load attendance data.');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Toggle attendance
  const handleToggle = useCallback((swimmerId: number, present: boolean) => {
    setAttendanceMap((prev) => ({ ...prev, [swimmerId]: present }));
    if (!present) {
      // Clear rating when marked absent
      setRatingsMap((prev) => {
        const next = { ...prev };
        delete next[swimmerId];
        return next;
      });
    }
  }, []);

  // Rate swimmer
  const handleRate = useCallback((swimmerId: number, rating: number) => {
    setRatingsMap((prev) => ({ ...prev, [swimmerId]: rating }));
  }, []);

  // Mark all present
  const handleMarkAllPresent = useCallback(() => {
    if (!data) return;
    const allPresent: Record<number, boolean> = {};
    data.roster.forEach((item) => {
      allPresent[item.swimmer_id] = true;
    });
    setAttendanceMap(allPresent);
  }, [data]);

  // Start session
  const handleStartSession = useCallback(async () => {
    setIsStarting(true);
    try {
      await startSession(sessionId);
      await fetchAttendance();
    } catch {
      Alert.alert('Error', 'Failed to start session.');
    } finally {
      setIsStarting(false);
    }
  }, [sessionId, startSession, fetchAttendance]);

  // Complete session
  const handleCompleteSession = useCallback(() => {
    if (!data) return;

    Alert.alert(
      'Complete Session',
      'Save attendance and complete this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          style: 'destructive',
          onPress: async () => {
            setIsSubmitting(true);
            const payload: SessionCompletePayload = {
              summary_notes: summaryNotes || undefined,
              attendance: data.roster.map((item) => ({
                swimmer_id: item.swimmer_id,
                present: attendanceMap[item.swimmer_id] ?? false,
              })),
              evaluations: Object.entries(ratingsMap)
                .filter(([, rating]) => rating > 0)
                .map(([swimmerId, rating]) => ({
                  swimmer_id: Number(swimmerId),
                  rating,
                })),
              group_evaluation:
                groupRating > 0 ? { rating: groupRating } : undefined,
            };
            try {
              await coachService.completeSession(sessionId, payload);
              Alert.alert('Success', 'Session completed successfully.');
              navigation.popToTop();
            } catch {
              Alert.alert('Error', 'Failed to complete session.');
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ],
    );
  }, [
    data,
    attendanceMap,
    ratingsMap,
    summaryNotes,
    groupRating,
    sessionId,
    navigation,
  ]);

  // Count present swimmers
  const presentCount = Object.values(attendanceMap).filter(Boolean).length;
  const totalCount = data?.roster.length ?? 0;

  // Loading / Error states
  if (isLoading && !data) {
    return <Loader message="Loading attendance..." />;
  }

  if (error && !data) {
    return <ErrorView message={error} onRetry={fetchAttendance} />;
  }

  if (!data) {
    return <Loader message="Loading attendance..." />;
  }

  const session = data.session;
  const status = session.status;
  const isReadOnly = status === 'Completed' || status === 'Cancelled';
  const isScheduled = status === 'Scheduled';
  const isLive = status === 'Live';
  const statusStyle = STATUS_COLORS[status] ?? STATUS_COLORS.Scheduled;

  return (
    <View style={s.container}>
      <ScrollView
        style={s.scrollView}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Session Header ── */}
        <Animated.View style={headerEntry}>
          <Card style={s.headerCard}>
            <View style={s.headerTop}>
              <Text style={s.sessionTitle} numberOfLines={2}>
                {session.title || session.group.name}
              </Text>
              <View style={[s.statusBadge, { backgroundColor: statusStyle.bg }]}>
                <Text style={[s.statusText, { color: statusStyle.text }]}>
                  {status}
                </Text>
              </View>
            </View>

            <View style={s.metaRow}>
              <View style={s.metaChip}>
                <Icon name="calendar-event-line" size={14} color={colors.primary} />
                <Text style={s.metaChipText}>{formatDate(session.date)}</Text>
              </View>
              <View style={s.metaChip}>
                <Icon name="time-line" size={14} color={colors.orange} />
                <Text style={s.metaChipText}>
                  {formatTime(session.start_time)} – {formatTime(session.end_time)}
                </Text>
              </View>
            </View>

            <View style={s.metaRow}>
              <View style={s.metaChip}>
                <Icon name="team-fill" size={14} color={colors.swimmer} />
                <Text style={s.metaChipText}>{session.group.name}</Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* ── Scheduled: Start Session ── */}
        {isScheduled && (
          <Animated.View style={summaryEntry}>
            <Card style={s.scheduledCard}>
              <View style={s.scheduledContent}>
                <View style={s.scheduledIconCircle}>
                  <Icon name="time-fill" size={28} color={colors.primary} />
                </View>
                <Text style={s.scheduledTitle}>Session not started yet</Text>
                <Text style={s.scheduledSubtitle}>
                  Start the session to begin recording attendance
                </Text>
                <Button
                  variant="blue"
                  title="Start Session"
                  loading={isStarting}
                  onPress={handleStartSession}
                />
              </View>
            </Card>
          </Animated.View>
        )}

        {/* ── Live / Completed: Summary Strip ── */}
        {(isLive || isReadOnly) && (
          <Animated.View style={[s.summaryStrip, summaryEntry]}>
            <View style={s.summaryItem}>
              <Text style={s.summaryNumber}>{presentCount}</Text>
              <Text style={s.summaryLabel}>Present</Text>
            </View>
            <View style={s.summaryDivider} />
            <View style={s.summaryItem}>
              <Text style={[s.summaryNumber, { color: colors.error }]}>
                {totalCount - presentCount}
              </Text>
              <Text style={s.summaryLabel}>Absent</Text>
            </View>
            <View style={s.summaryDivider} />
            <View style={s.summaryItem}>
              <Text style={s.summaryNumber}>{totalCount}</Text>
              <Text style={s.summaryLabel}>Total</Text>
            </View>
          </Animated.View>
        )}

        {/* ── Roster ── */}
        {(isLive || isReadOnly) && (
          <Animated.View style={rosterEntry}>
            <View style={s.sectionHeader}>
              <View style={[s.sectionIconCircle, { backgroundColor: colors.swimmerDim }]}>
                <Icon name="group-fill" size={16} color={colors.swimmer} />
              </View>
              <Text style={s.sectionLabel}>Swimmers</Text>

              {/* Mark all present button (only for live) */}
              {isLive && (
                <TouchableOpacity
                  onPress={handleMarkAllPresent}
                  style={s.markAllBtn}
                  activeOpacity={0.7}
                >
                  <Icon name="checkbox-circle-fill" size={14} color={colors.swimmer} />
                  <Text style={s.markAllText}>Mark All</Text>
                </TouchableOpacity>
              )}
            </View>

            {data.roster.map((swimmer, index) => (
              <SwimmerAttendanceRow
                key={swimmer.swimmer_id}
                swimmer={swimmer}
                isPresent={attendanceMap[swimmer.swimmer_id] ?? false}
                rating={ratingsMap[swimmer.swimmer_id] ?? 0}
                readOnly={isReadOnly}
                index={index}
                onToggle={handleToggle}
                onRate={handleRate}
              />
            ))}
          </Animated.View>
        )}

        {/* ── Group Rating (Live only) ── */}
        {isLive && (
          <Animated.View style={notesEntry}>
            <View style={s.sectionHeader}>
              <View style={[s.sectionIconCircle, { backgroundColor: colors.warningDim }]}>
                <Icon name="star-fill" size={16} color={colors.warning} />
              </View>
              <Text style={s.sectionLabel}>Group Rating</Text>
            </View>
            <Card style={s.sectionCard}>
              <View style={s.groupRatingContent}>
                <Text style={s.groupRatingHint}>
                  Rate the overall group performance
                </Text>
                <StarRating size={32} rating={groupRating} onRate={setGroupRating} />
                {groupRating > 0 && (
                  <View style={s.ratingValueBadge}>
                    <Text style={s.ratingValueText}>{groupRating}/5</Text>
                  </View>
                )}
              </View>
            </Card>

            {/* Session Notes */}
            <View style={s.sectionHeader}>
              <View style={[s.sectionIconCircle, { backgroundColor: colors.secondaryDim }]}>
                <Icon name="file-list-fill" size={16} color={colors.secondary} />
              </View>
              <Text style={s.sectionLabel}>Session Notes</Text>
            </View>
            <Card style={s.sectionCard}>
              <TextInput
                style={s.notesInput}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholder="Add notes about drills, swimmer feedback, highlights..."
                placeholderTextColor={colors.textDim}
                value={summaryNotes}
                onChangeText={setSummaryNotes}
              />
            </Card>
          </Animated.View>
        )}

        {/* Bottom padding */}
        {isLive && <View style={s.bottomPadding} />}
      </ScrollView>

      {/* ── Sticky Complete Button (Live only) ── */}
      {isLive && (
        <View style={s.stickyBottom}>
          <Button
            variant="primary"
            title="Complete Session"
            loading={isSubmitting}
            onPress={handleCompleteSession}
          />
        </View>
      )}
    </View>
  );
};

// ── Styles ──────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },

  /* Header card */
  headerCard: {
    marginBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sessionTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm + spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
  },
  statusText: {
    fontSize: 11,
    fontFamily: fontFamily.bodySemiBold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm + spacing.xs,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.pill,
  },
  metaChipText: {
    fontSize: 13,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
  },

  /* Scheduled state */
  scheduledCard: {
    marginBottom: spacing.md,
  },
  scheduledContent: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  scheduledIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduledTitle: {
    fontSize: 18,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  scheduledSubtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },

  /* Summary strip */
  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  summaryNumber: {
    fontSize: 22,
    fontFamily: fontFamily.headingBold,
    color: colors.swimmer,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.borderLight,
  },

  /* Section headers */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  sectionCard: {
    marginBottom: spacing.lg,
  },

  /* Mark all button */
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.swimmerDim,
    paddingHorizontal: spacing.sm + spacing.xs,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.pill,
  },
  markAllText: {
    fontSize: 12,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.swimmer,
  },

  /* Swimmer row */
  swimmerRow: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  swimmerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontFamily: fontFamily.headingBold,
  },
  swimmerNameCol: {
    flex: 1,
  },
  swimmerName: {
    fontSize: 15,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
  readOnlyStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  readOnlyStatusText: {
    fontSize: 12,
    fontFamily: fontFamily.bodyMedium,
  },

  /* Toggle buttons */
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
  },
  toggleBtnActive: {},
  toggleBtnInactive: {
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceLight,
  },
  toggleText: {
    fontSize: 13,
    fontFamily: fontFamily.bodySemiBold,
  },

  /* Rating row */
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ratingLabel: {
    fontSize: 13,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.warningDark,
  },

  /* Group rating */
  groupRatingContent: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  groupRatingHint: {
    fontSize: 13,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
  },
  ratingValueBadge: {
    backgroundColor: colors.warningDim,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
  },
  ratingValueText: {
    fontSize: 14,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.warningDark,
  },

  /* Notes */
  notesInput: {
    fontSize: 14,
    fontFamily: fontFamily.bodyRegular,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    padding: 0,
  },

  /* Bottom spacing + sticky */
  bottomPadding: {
    height: spacing.xxl * 2,
  },
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadows.md,
  },
});
