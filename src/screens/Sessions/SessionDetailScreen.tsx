import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  Linking,
  RefreshControl,
} from 'react-native';
import { RouteProp, useFocusEffect, useRoute } from '@react-navigation/native';
import { Card } from '../../components/common/Card';
import { Icon } from '../../components/common/Icon';
import { InfoRow } from '../../components/common/InfoRow';
import { Loader } from '../../components/common/Loader';
import { ErrorView } from '../../components/common/ErrorView';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import { useSessionStore } from '../../store/session.store';
import { RootStackParamList } from '../../types/navigation.types';
import { SessionDetailInterface } from '../../types/models.types';
import {
  formatDate,
  formatDuration,
  formatTimeRange,
  getRelativeDate,
} from '../../utils/formatters';
import { colors, spacing, fontFamily, borderRadius } from '../../theme';

type DetailRoute = RouteProp<RootStackParamList, 'SessionDetail'>;

const openUrl = (url: string) => {
  Linking.openURL(url).catch(() => {
    // No handler for this URL (e.g. no dialer on a simulator) — nothing to do.
  });
};

/** Tinted status pill: dim background + colored text, per the design system. */
const statusTone = (status: SessionDetailInterface['status']) => {
  switch (status) {
    case 'Live':
      return { bg: colors.warningDim, fg: colors.warningDark };
    case 'Completed':
      return { bg: colors.swimmerDim, fg: colors.swimmerDark };
    case 'Cancelled':
      return { bg: colors.errorDim, fg: colors.error };
    default:
      return { bg: colors.primaryDim, fg: colors.primary };
  }
};

const Stars: React.FC<{ rating: number }> = ({ rating }) => (
  <View style={s.stars} accessibilityLabel={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Icon
        key={i}
        name={i <= rating ? 'star-fill' : 'star-line'}
        size={16}
        color={i <= rating ? colors.warning : colors.textDim}
      />
    ))}
  </View>
);

const SectionTitle: React.FC<{ children: string }> = ({ children }) => (
  <Text style={s.sectionTitle}>{children}</Text>
);

/**
 * Everything about one session, opened from a session card on Home or the
 * Sessions tab. Reads GET /swimmer/sessions/:id through the session store.
 *
 * The club's notes sit right under the header: they are usually the one thing
 * a swimmer must act on (bring fins, pool changed, start earlier).
 */
export const SessionDetailScreen: React.FC = () => {
  const { sessionId } = useRoute<DetailRoute>().params;
  const session = useSessionStore((st) => st.sessionDetail);
  const isLoading = useSessionStore((st) => st.isDetailLoading);
  const error = useSessionStore((st) => st.detailError);
  const fetchSessionDetail = useSessionStore((st) => st.fetchSessionDetail);

  const headerEntry = useAnimatedEntry(0);
  const notesEntry = useAnimatedEntry(1);
  const whenEntry = useAnimatedEntry(2);
  const trainingEntry = useAnimatedEntry(3);
  const resultEntry = useAnimatedEntry(4);

  const load = useCallback(() => {
    fetchSessionDetail(sessionId);
  }, [fetchSessionDetail, sessionId]);

  // Refetch on focus: a coach may start, finish or grade the session while the
  // swimmer has the app open.
  useFocusEffect(load);

  // Only trust the store's session if it is the one this screen was opened for.
  const current = session?.id === sessionId ? session : null;

  if (!current && isLoading) {
    return <Loader message="Loading session…" />;
  }

  if (!current) {
    return (
      <View style={s.centered}>
        <ErrorView
          message={error ?? "Couldn't load this session."}
          onRetry={load}
        />
      </View>
    );
  }

  const tone = statusTone(current.status);
  const duration = formatDuration(current.duration_minutes);
  const branch = current.branch;
  const coach = current.coach;
  const attendanceTaken = current.my_attendance !== null;
  const isOver =
    current.status === 'Completed' || current.status === 'Cancelled';

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={load}
          tintColor={colors.primary}
        />
      }
    >
      {/* ═══ Header ═══ */}
      <Animated.View style={headerEntry}>
        <Card>
          <View style={s.pillRow}>
            <View style={[s.pill, { backgroundColor: tone.bg }]}>
              <Text style={[s.pillText, { color: tone.fg }]}>
                {current.status}
              </Text>
            </View>
            {current.type ? (
              <View style={[s.pill, { backgroundColor: colors.surfaceLight }]}>
                <Text style={[s.pillText, { color: colors.textMuted }]}>
                  {current.type}
                </Text>
              </View>
            ) : null}
          </View>

          <Text style={s.title}>{current.title || current.type || 'Session'}</Text>

          <View style={s.metaRow}>
            <Icon name="calendar-event-line" size={16} color={colors.textMuted} />
            <Text style={s.metaText}>{getRelativeDate(current.date)}</Text>
            <Text style={s.metaDot}>•</Text>
            <Icon name="time-line" size={16} color={colors.textMuted} />
            <Text style={s.metaText}>
              {formatTimeRange(current.start_time, current.end_time)}
            </Text>
          </View>

          {/* Upcoming: what attending is worth. Over: nothing to promise. */}
          {!isOver && !attendanceTaken && current.xp.per_attendance > 0 && (
            <View style={[s.xpBanner, { backgroundColor: colors.primaryDim }]}>
              <Icon name="flashlight-fill" size={18} color={colors.primary} />
              <Text style={[s.xpText, { color: colors.primary }]}>
                +{current.xp.per_attendance} XP when you attend
              </Text>
            </View>
          )}
        </Card>
      </Animated.View>

      {/* ═══ Notes from the club ═══ */}
      {current.notes ? (
        <Animated.View style={[s.section, notesEntry]}>
          <SectionTitle>Notes from your club</SectionTitle>
          <Card>
            <View style={s.notesRow}>
              <View style={[s.notesIcon, { backgroundColor: colors.primaryDim }]}>
                <Icon name="file-text-line" size={18} color={colors.primary} />
              </View>
              <Text style={s.notesText} selectable>
                {current.notes}
              </Text>
            </View>
          </Card>
        </Animated.View>
      ) : null}

      {/* ═══ When & where ═══ */}
      <Animated.View style={[s.section, whenEntry]}>
        <SectionTitle>When & where</SectionTitle>
        <Card>
          <InfoRow
            icon="calendar-event-line"
            label="Date"
            value={formatDate(current.date)}
          />
          <InfoRow
            icon="time-line"
            label="Time"
            value={formatTimeRange(current.start_time, current.end_time)}
            hint={duration ? `${duration} session` : undefined}
            isLast={!branch && !current.location}
          />
          {branch && (
            <InfoRow
              icon="building-2-line"
              label="Branch"
              value={branch.name}
              hint={
                [branch.address, branch.city].filter(Boolean).join(', ') ||
                undefined
              }
              onPress={() =>
                openUrl(
                  `https://maps.apple.com/?q=${encodeURIComponent(
                    [branch.name, branch.address, branch.city]
                      .filter(Boolean)
                      .join(', '),
                  )}`,
                )
              }
              isLast={!current.location}
            />
          )}
          {current.location ? (
            <InfoRow
              icon="map-pin-line"
              label="Pool"
              value={current.location}
              isLast
            />
          ) : null}
        </Card>
      </Animated.View>

      {/* ═══ Training ═══ */}
      <Animated.View style={[s.section, trainingEntry]}>
        <SectionTitle>Training</SectionTitle>
        <Card>
          {current.group && (
            <InfoRow
              icon="group-line"
              label="Group"
              value={current.group.name}
              isLast={!coach && !current.plan}
            />
          )}
          {coach && (
            <InfoRow
              icon="user-line"
              label="Coach"
              value={coach.name}
              hint={
                [
                  coach.specialization,
                  coach.phone ? 'Tap to call' : null,
                ]
                  .filter(Boolean)
                  .join(' · ') || undefined
              }
              onPress={
                coach.phone ? () => openUrl(`tel:${coach.phone}`) : undefined
              }
              isLast={!current.plan}
            />
          )}
          {current.plan && (
            <InfoRow
              icon="clipboard-line"
              label="Training plan"
              value={current.plan.title}
              isLast
            />
          )}
          {!current.group && !coach && !current.plan && (
            <Text style={s.emptyText}>No training details for this session yet.</Text>
          )}
        </Card>
      </Animated.View>

      {/* ═══ Your result — only once the coach has recorded something ═══ */}
      {(attendanceTaken || current.my_evaluation || current.group_evaluation) && (
        <Animated.View style={[s.section, resultEntry]}>
          <SectionTitle>Your result</SectionTitle>
          <Card>
            {current.my_attendance && (
              <InfoRow
                icon={
                  current.my_attendance.present
                    ? 'checkbox-circle-fill'
                    : 'close-circle-fill'
                }
                label="Attendance"
                value={current.my_attendance.present ? 'Present' : 'Absent'}
                hint={
                  current.xp.earned != null
                    ? current.xp.earned > 0
                      ? `+${current.xp.earned} XP earned`
                      : 'No XP for this session'
                    : undefined
                }
                isLast={!current.my_evaluation && !current.group_evaluation}
              />
            )}

            {current.my_evaluation && (
              <View
                style={[
                  s.evalBlock,
                  !current.group_evaluation && s.evalBlockLast,
                ]}
              >
                <View style={s.evalHeader}>
                  <Text style={s.evalLabel}>Coach's rating for you</Text>
                  <Stars rating={current.my_evaluation.rating} />
                </View>
                {current.my_evaluation.notes ? (
                  <Text style={s.evalNotes} selectable>
                    {current.my_evaluation.notes}
                  </Text>
                ) : null}
              </View>
            )}

            {current.group_evaluation && (
              <View style={[s.evalBlock, s.evalBlockLast]}>
                <View style={s.evalHeader}>
                  <Text style={s.evalLabel}>Team feedback</Text>
                  <Stars rating={current.group_evaluation.rating} />
                </View>
                {current.group_evaluation.notes ? (
                  <Text style={s.evalNotes} selectable>
                    {current.group_evaluation.notes}
                  </Text>
                ) : null}
              </View>
            )}
          </Card>
        </Animated.View>
      )}
    </ScrollView>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
    letterSpacing: 0.4,
    marginBottom: spacing.sm + 2,
  },

  /* Header */
  pillRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm + 2,
  },
  pill: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
  },
  pillText: {
    fontSize: 12,
    fontFamily: fontFamily.bodySemiBold,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.sm,
  },
  metaText: {
    fontSize: 14,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
  },
  metaDot: {
    fontSize: 14,
    color: colors.textDim,
    marginHorizontal: 2,
  },
  xpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
  },
  xpText: {
    fontSize: 14,
    fontFamily: fontFamily.bodySemiBold,
  },

  /* Notes */
  notesRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  notesIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 23,
    fontFamily: fontFamily.bodyRegular,
    color: colors.text,
    paddingTop: 7,
  },

  /* Result */
  evalBlock: {
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  evalBlockLast: {
    borderBottomWidth: 0,
  },
  evalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  evalLabel: {
    fontSize: 13,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  evalNotes: {
    marginTop: spacing.sm,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    paddingVertical: spacing.sm,
  },
});
