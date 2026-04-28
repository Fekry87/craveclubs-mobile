import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
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
import { ElapsedTimer } from '../../components/features/coach/ElapsedTimer';
import { StarRating } from '../../components/features/coach/StarRating';
import { SwimmerRosterItem } from '../../components/features/coach/SwimmerRosterItem';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import { usePulseGlow } from '../../hooks/usePulseGlow';
import { useCoachStore } from '../../store/coach.store';
import { CoachSessionsStackParamList } from '../../navigation/types';
import {
  SwimmerProfileInterface,
  SessionCompletePayload,
} from '../../types/models.types';
import {
  colors,
  spacing,
  fontFamily,
  borderRadius,
  shadows,
} from '../../theme';

type Props = NativeStackScreenProps<CoachSessionsStackParamList, 'CoachSessionLive'>;

export const CoachSessionLiveScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const { sessionId } = route.params;
  const {
    selectedSession,
    isDetailLoading,
    detailError,
    fetchSessionDetail,
    roster,
    isRosterLoading,
    fetchRoster,
    completeSession,
  } = useCoachStore();

  const [attendanceMap, setAttendanceMap] = useState<Record<number, boolean>>({});
  const [ratingsMap, setRatingsMap] = useState<Record<number, number>>({});
  const [summaryNotes, setSummaryNotes] = useState('');
  const [groupRating, setGroupRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hooks declared at top level (rules of hooks)
  const headerEntry = useAnimatedEntry(0);
  const groupRatingEntry = useAnimatedEntry(1);
  const rosterEntry = useAnimatedEntry(2);
  const notesEntry = useAnimatedEntry(3);
  const pulseGlow = usePulseGlow();

  useEffect(() => {
    fetchSessionDetail(sessionId);
    fetchRoster(sessionId);
  }, [sessionId, fetchSessionDetail, fetchRoster]);

  // Initialize attendance map when roster loads (all present by default)
  useEffect(() => {
    if (roster.length > 0) {
      const initialAttendance: Record<number, boolean> = {};
      roster.forEach((swimmer) => {
        initialAttendance[swimmer.id] = true;
      });
      setAttendanceMap(initialAttendance);
    }
  }, [roster]);

  const handleToggleAttendance = useCallback((swimmerId: number) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [swimmerId]: !(prev[swimmerId] ?? true),
    }));
  }, []);

  const handleRate = useCallback((swimmerId: number, rating: number) => {
    setRatingsMap((prev) => ({
      ...prev,
      [swimmerId]: rating,
    }));
  }, []);

  const handleEndSession = useCallback(() => {
    Alert.alert(
      'End Session',
      'Complete this session and save all attendance, ratings, and notes?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: async () => {
            setIsSubmitting(true);
            const payload: SessionCompletePayload = {
              summary_notes: summaryNotes || undefined,
              attendance: roster.map((s) => ({
                swimmer_id: s.id,
                present: attendanceMap[s.id] ?? true,
              })),
              evaluations: roster
                .filter((s) => (ratingsMap[s.id] ?? 0) > 0)
                .map((s) => ({
                  swimmer_id: s.id,
                  rating: ratingsMap[s.id],
                })),
              group_evaluation:
                groupRating > 0 ? { rating: groupRating } : undefined,
            };
            await completeSession(sessionId, payload);
            setIsSubmitting(false);
            // Pop to sessions list — NOT goBack (which would go to detail of a now-completed session)
            navigation.popToTop();
          },
        },
      ],
    );
  }, [
    summaryNotes,
    roster,
    attendanceMap,
    ratingsMap,
    groupRating,
    completeSession,
    sessionId,
    navigation,
  ]);

  const renderSwimmerItem = useCallback(
    ({ item }: { item: SwimmerProfileInterface }) => (
      <SwimmerRosterItem
        swimmerId={item.id}
        name={`${item.first_name} ${item.last_name}`}
        level={item.level}
        isPresent={attendanceMap[item.id] ?? true}
        rating={ratingsMap[item.id] ?? 0}
        onToggleAttendance={handleToggleAttendance}
        onRate={handleRate}
      />
    ),
    [attendanceMap, ratingsMap, handleToggleAttendance, handleRate],
  );

  const keyExtractor = useCallback(
    (item: SwimmerProfileInterface) => item.id.toString(),
    [],
  );

  // Count present swimmers
  const presentCount = Object.values(attendanceMap).filter(Boolean).length;
  const totalCount = roster.length;

  if (isDetailLoading && !selectedSession) {
    return <Loader message="Loading session..." />;
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
    return <Loader message="Loading session..." />;
  }

  const session = selectedSession;

  return (
    <View style={s.container}>
      <ScrollView
        style={s.scrollView}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Live Session Header ── */}
        <Animated.View style={[s.headerCard, headerEntry]}>
          <View style={s.headerTop}>
            {/* Live badge */}
            <Animated.View style={[s.liveBadge, { opacity: pulseGlow.opacity }]}>
              <Icon name="flashlight-fill" size={14} color={colors.white} />
              <Text style={s.liveBadgeText}>LIVE</Text>
            </Animated.View>

            {/* Elapsed timer */}
            {session.started_at && (
              <ElapsedTimer startTime={session.started_at} style={s.timer} />
            )}
          </View>

          <Text style={s.sessionTitle} numberOfLines={2}>
            {session.title || session.type}
          </Text>

          {/* Session meta info */}
          <View style={s.metaRow}>
            {session.group?.name && (
              <View style={s.metaChip}>
                <Icon name="team-fill" size={14} color={colors.primary} />
                <Text style={s.metaChipText}>{session.group.name}</Text>
              </View>
            )}
            {session.location && (
              <View style={s.metaChip}>
                <Icon name="map-pin-fill" size={14} color={colors.orange} />
                <Text style={s.metaChipText}>{session.location}</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* ── Group Rating Section ── */}
        <Animated.View style={groupRatingEntry}>
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
              <StarRating
                size={32}
                rating={groupRating}
                onRate={setGroupRating}
              />
              {groupRating > 0 && (
                <View style={s.ratingValueBadge}>
                  <Text style={s.ratingValueText}>{groupRating}/5</Text>
                </View>
              )}
            </View>
          </Card>
        </Animated.View>

        {/* ── Swimmers Roster Section ── */}
        <Animated.View style={rosterEntry}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionIconCircle, { backgroundColor: colors.swimmerDim }]}>
              <Icon name="group-fill" size={16} color={colors.swimmer} />
            </View>
            <Text style={s.sectionLabel}>Swimmers</Text>
            <View style={s.rosterCountBadge}>
              <Text style={s.rosterCountText}>
                {presentCount}/{totalCount}
              </Text>
            </View>
          </View>

          {isRosterLoading && roster.length === 0 ? (
            <Card style={s.sectionCard}>
              <Loader message="Loading roster..." />
            </Card>
          ) : (
            <Card style={s.sectionCard}>
              {/* Column labels */}
              <View style={s.rosterHeader}>
                <Text style={[s.rosterHeaderLabel, s.rosterHeaderName]}>
                  Swimmer
                </Text>
                <Text style={s.rosterHeaderLabel}>
                  Here?
                </Text>
                <Text style={[s.rosterHeaderLabel, s.rosterHeaderRating]}>
                  Rating
                </Text>
              </View>
              <FlatList
                data={roster}
                keyExtractor={keyExtractor}
                renderItem={renderSwimmerItem}
                scrollEnabled={false}
              />
            </Card>
          )}
        </Animated.View>

        {/* ── Session Notes Section ── */}
        <Animated.View style={notesEntry}>
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

        {/* Bottom padding for sticky button clearance */}
        <View style={s.bottomPadding} />
      </ScrollView>

      {/* ── Sticky End Session Button ── */}
      <View style={s.stickyBottom}>
        <Button
          variant="danger"
          title="End Session"
          loading={isSubmitting}
          onPress={handleEndSession}
        />
      </View>
    </View>
  );
};

/* ── Styles ── */
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

  /* ── Header card ── */
  headerCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm + spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
  },
  liveBadgeText: {
    fontSize: 11,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.white,
    letterSpacing: 1,
  },
  timer: {
    flexShrink: 0,
  },
  sessionTitle: {
    fontSize: 22,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
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

  /* ── Section headers ── */
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

  /* ── Group Rating ── */
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

  /* ── Roster ── */
  rosterCountBadge: {
    backgroundColor: colors.swimmerDim,
    paddingHorizontal: spacing.sm + spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
  },
  rosterCountText: {
    fontSize: 13,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.swimmer,
  },
  rosterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    marginBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  rosterHeaderLabel: {
    fontSize: 11,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rosterHeaderName: {
    flex: 1,
  },
  rosterHeaderRating: {
    marginLeft: spacing.sm,
  },

  /* ── Notes ── */
  notesInput: {
    fontSize: 14,
    fontFamily: fontFamily.bodyRegular,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    padding: 0,
  },

  /* ── Bottom spacing + sticky ── */
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
