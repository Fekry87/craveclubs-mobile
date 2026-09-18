import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Icon } from '../../components/common/Icon';
import { Loader } from '../../components/common/Loader';
import { SwimmerAvatar } from '../../components/common/SwimmerAvatar';
import { ChoiceChipGroup } from '../../components/features/registration/ChoiceChip';
import { SectionLabel, FieldError } from '../../components/features/registration/SectionLabel';
import { useCoachStore } from '../../store/coach.store';
import { useMeasurementStore } from '../../store/measurement.store';
import { describeMeasurementError } from '../../api/services/measurement.service';
import { CoachSessionsStackParamList } from '../../navigation/types';
import { SwimmerProfileInterface } from '../../types/models.types';
import { formatDistance, formatSwimTime } from '../../utils/formatters';
import { colors, spacing, fontFamily, borderRadius, typography, shadows } from '../../theme';

type Props = NativeStackScreenProps<CoachSessionsStackParamList, 'CoachGroupMeasurement'>;

/** Longest time the API stores (decimal 7,2). */
const MAX_SECONDS = 99999.99;

type Phase = 'setup' | 'running';

/** One swimmer's state during the race. */
interface RaceResult {
  /** Captured at the finish tap, in seconds with two decimals. */
  seconds: number;
  status: 'saving' | 'saved' | 'failed';
}

/**
 * قياس مجموعة — the coach times several swimmers swimming the same event at
 * once. Setup picks the swim type, the distance and the swimmers; Start is
 * the gun: one stopwatch runs, every swimmer gets a Finish button, and each
 * finish saves that swimmer's time right away (a dropped connection or a
 * closed app never loses the swimmers who already touched the wall). "End
 * measurement" arms once everyone still in the race is saved.
 */
export const CoachGroupMeasurementScreen: React.FC<Props> = ({ route, navigation }) => {
  const { sessionId } = route.params;

  const roster = useCoachStore((st) => st.roster);
  const isRosterLoading = useCoachStore((st) => st.isRosterLoading);
  const fetchRoster = useCoachStore((st) => st.fetchRoster);

  const options = useMeasurementStore((st) => st.options);
  const isOptionsLoading = useMeasurementStore((st) => st.isOptionsLoading);
  const optionsError = useMeasurementStore((st) => st.optionsError);
  const fetchOptions = useMeasurementStore((st) => st.fetchOptions);
  const record = useMeasurementStore((st) => st.record);

  const [phase, setPhase] = useState<Phase>('setup');
  const [strokeId, setStrokeId] = useState<string | null>(null);
  const [distanceId, setDistanceId] = useState<string | null>(null);
  /** Setup: who swims. Missing key = selected (the roster starts all-in). */
  const [deselected, setDeselected] = useState<Record<number, boolean>>({});
  /** Running: swimmers the coach pulled out of the race after the start. */
  const [removed, setRemoved] = useState<Record<number, boolean>>({});
  const [results, setResults] = useState<Record<number, RaceResult>>({});
  const [elapsedCentis, setElapsedCentis] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const startedAt = useRef(0);
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null);
  // The race lineup is frozen at the gun, so a roster refresh mid-race
  // cannot add or drop lanes.
  const [racers, setRacers] = useState<SwimmerProfileInterface[]>([]);

  useEffect(() => {
    fetchRoster(sessionId);
    fetchOptions();
  }, [sessionId, fetchRoster, fetchOptions]);

  const stopTicker = useCallback(() => {
    if (ticker.current) {
      clearInterval(ticker.current);
      ticker.current = null;
    }
  }, []);
  useEffect(() => stopTicker, [stopTicker]);

  const selectedSwimmers = useMemo(
    () => roster.filter((swimmer) => !deselected[swimmer.id]),
    [roster, deselected],
  );

  const activeRacers = useMemo(
    () => racers.filter((swimmer) => !removed[swimmer.id]),
    [racers, removed],
  );
  const allSaved =
    activeRacers.length > 0 &&
    activeRacers.every((swimmer) => results[swimmer.id]?.status === 'saved');
  const raceSettled = activeRacers.every((swimmer) => results[swimmer.id] !== undefined);

  /* ─── The gun ─── */
  const handleStart = useCallback(() => {
    if (!strokeId || !distanceId || selectedSwimmers.length === 0) return;
    setRacers(selectedSwimmers);
    setResults({});
    setRemoved({});
    setError(null);
    setElapsedCentis(0);
    startedAt.current = Date.now();
    ticker.current = setInterval(
      () => setElapsedCentis(Math.floor((Date.now() - startedAt.current) / 10)),
      100,
    );
    setPhase('running');
  }, [strokeId, distanceId, selectedSwimmers]);

  /* ─── Saving one swimmer ─── */
  const save = useCallback(
    async (swimmerId: number, seconds: number) => {
      setResults((prev) => ({ ...prev, [swimmerId]: { seconds, status: 'saving' } }));
      try {
        await record(sessionId, {
          swimmer_id: swimmerId,
          stroke_skill_id: Number(strokeId),
          distance_skill_id: Number(distanceId),
          time_seconds: seconds,
        });
        setResults((prev) => ({ ...prev, [swimmerId]: { seconds, status: 'saved' } }));
      } catch (err: unknown) {
        setResults((prev) => ({ ...prev, [swimmerId]: { seconds, status: 'failed' } }));
        setError(describeMeasurementError(err));
      }
    },
    [record, sessionId, strokeId, distanceId],
  );

  const handleFinish = useCallback(
    (swimmerId: number) => {
      const seconds = Math.min(
        MAX_SECONDS,
        Math.round((Date.now() - startedAt.current) / 10) / 100,
      );
      save(swimmerId, seconds);
    },
    [save],
  );

  const handleRemove = useCallback((swimmer: SwimmerProfileInterface) => {
    Alert.alert(
      'Remove from this race?',
      `${swimmer.first_name} won't get a time for this swim.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setRemoved((prev) => ({ ...prev, [swimmer.id]: true })),
        },
      ],
    );
  }, []);

  // The clock stops when the last racer is settled.
  useEffect(() => {
    if (phase === 'running' && raceSettled) stopTicker();
  }, [phase, raceSettled, stopTicker]);

  /* ─── Leaving mid-race asks first ─── */
  useEffect(() => {
    if (phase !== 'running' || allSaved) return undefined;
    const unsub = navigation.addListener('beforeRemove', (event) => {
      event.preventDefault();
      const savedCount = Object.values(results).filter((r) => r.status === 'saved').length;
      Alert.alert(
        'Stop group measurement?',
        savedCount > 0
          ? `${savedCount} saved ${savedCount === 1 ? 'time stays' : 'times stay'}; swimmers who haven't finished get nothing.`
          : "The stopwatch stops and nobody gets a time.",
        [
          { text: 'Keep timing', style: 'cancel' },
          {
            text: 'Stop',
            style: 'destructive',
            onPress: () => navigation.dispatch(event.data.action),
          },
        ],
      );
    });
    return unsub;
  }, [navigation, phase, allSaved, results]);

  /* ═══ Setup ═══ */

  const strokeOptions = useMemo(
    () => (options?.strokes ?? []).map((s) => ({ value: String(s.id), label: s.name })),
    [options],
  );
  const distanceOptions = useMemo(
    () =>
      (options?.distances ?? []).map((d) => ({ value: String(d.id), label: formatDistance(d) })),
    [options],
  );
  const hasOptions = strokeOptions.length > 0 && distanceOptions.length > 0;

  if (phase === 'setup') {
    if ((isRosterLoading && roster.length === 0) || (!options && isOptionsLoading)) {
      return <Loader message="Loading..." />;
    }

    return (
      <View style={s.container}>
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <Text style={s.intro}>
            Everyone swims the same event; one stopwatch times them all. Tap a
            swimmer's <Text style={s.introBold}>Finish</Text> as they touch the wall.
          </Text>

          {!options && optionsError ? (
            <View style={s.status}>
              <Text style={s.statusText}>{optionsError}</Text>
              <Button title="Try again" variant="secondary" onPress={fetchOptions} />
            </View>
          ) : options && !hasOptions ? (
            <View style={s.status}>
              <Icon name="timer-line" size={28} color={colors.textDim} />
              <Text style={s.statusTitle}>
                {strokeOptions.length === 0 ? 'No swim types yet' : 'No distances yet'}
              </Text>
              <Text style={s.statusText}>
                Your club manager adds them in the portal, under Skills.
              </Text>
            </View>
          ) : (
            <>
              <SectionLabel>Swim type</SectionLabel>
              <ChoiceChipGroup options={strokeOptions} value={strokeId} onChange={setStrokeId} />

              <View style={s.gap} />
              <SectionLabel>Distance</SectionLabel>
              <ChoiceChipGroup
                options={distanceOptions}
                value={distanceId}
                onChange={setDistanceId}
              />

              <View style={s.gap} />
              <SectionLabel hint={`${selectedSwimmers.length} of ${roster.length}`}>
                Who's swimming
              </SectionLabel>
              <Card style={s.listCard}>
                {roster.map((swimmer, index) => {
                  const selected = !deselected[swimmer.id];
                  return (
                    <TouchableOpacity
                      key={swimmer.id}
                      style={[s.row, index === roster.length - 1 && s.rowLast]}
                      onPress={() =>
                        setDeselected((prev) => ({ ...prev, [swimmer.id]: selected }))
                      }
                      activeOpacity={0.7}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: selected }}
                      accessibilityLabel={`${swimmer.first_name} ${swimmer.last_name}`}
                    >
                      <SwimmerAvatar
                        avatarUrl={swimmer.avatar_url}
                        size={40}
                        fallback="initials"
                        firstName={swimmer.first_name}
                        lastName={swimmer.last_name}
                      />
                      <Text style={s.rowName} numberOfLines={1}>
                        {swimmer.first_name} {swimmer.last_name}
                      </Text>
                      <Icon
                        name={selected ? 'checkbox-circle-fill' : 'close-circle-line'}
                        size={24}
                        color={selected ? colors.primary : colors.textDim}
                      />
                    </TouchableOpacity>
                  );
                })}
                {roster.length === 0 && (
                  <Text style={s.statusText}>No swimmers on this session's roster.</Text>
                )}
              </Card>
            </>
          )}
        </ScrollView>

        <View style={s.footer}>
          <Button
            title="Start measurement"
            onPress={handleStart}
            disabled={!hasOptions || !strokeId || !distanceId || selectedSwimmers.length === 0}
          />
        </View>
      </View>
    );
  }

  /* ═══ Running ═══ */

  const strokeName = options?.strokes.find((o) => String(o.id) === strokeId)?.name ?? 'Swim';
  const distanceLabel = formatDistance(
    options?.distances.find((o) => String(o.id) === distanceId) ?? null,
  );

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* The clock */}
        <View style={s.clockCard}>
          <Text style={s.clockEvent}>
            {strokeName} · {distanceLabel}
          </Text>
          <Text style={s.clock}>{formatSwimTime(elapsedCentis / 100)}</Text>
          <Text style={s.clockHint}>
            {raceSettled
              ? allSaved
                ? 'All finished'
                : 'Waiting for times to save'
              : 'Tap Finish as each swimmer touches the wall'}
          </Text>
        </View>

        <Card style={s.listCard}>
          {racers.map((swimmer, index) => {
            const result = results[swimmer.id];
            const isRemoved = removed[swimmer.id];
            return (
              <View
                key={swimmer.id}
                style={[s.row, index === racers.length - 1 && s.rowLast]}
              >
                <SwimmerAvatar
                  avatarUrl={swimmer.avatar_url}
                  size={40}
                  fallback="initials"
                  firstName={swimmer.first_name}
                  lastName={swimmer.last_name}
                />
                <Text
                  style={[s.rowName, isRemoved && s.rowNameRemoved]}
                  numberOfLines={1}
                >
                  {swimmer.first_name} {swimmer.last_name}
                </Text>

                {isRemoved ? (
                  <Text style={s.removedText}>Removed</Text>
                ) : !result ? (
                  <>
                    <TouchableOpacity
                      style={s.finishBtn}
                      onPress={() => handleFinish(swimmer.id)}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityLabel={`Finish ${swimmer.first_name}`}
                    >
                      <Icon name="flashlight-fill" size={14} color={colors.white} />
                      <Text style={s.finishText}>Finish</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRemove(swimmer)}
                      hitSlop={10}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${swimmer.first_name} from this race`}
                    >
                      <Icon name="close-line" size={18} color={colors.textDim} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={s.rowTime}>{formatSwimTime(result.seconds)}</Text>
                    {result.status === 'saving' && (
                      <ActivityIndicator size="small" color={colors.primary} />
                    )}
                    {result.status === 'saved' && (
                      <Icon name="checkbox-circle-fill" size={20} color={colors.swimmer} />
                    )}
                    {result.status === 'failed' && (
                      <TouchableOpacity
                        style={s.retryBtn}
                        onPress={() => save(swimmer.id, result.seconds)}
                        accessibilityRole="button"
                      >
                        <Text style={s.retryText}>Retry</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            );
          })}
        </Card>

        <FieldError message={error} />
      </ScrollView>

      <View style={s.footer}>
        <Button
          title="End measurement"
          onPress={() => navigation.goBack()}
          disabled={!allSaved}
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
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  intro: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  introBold: {
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
  gap: {
    height: spacing.md,
  },
  status: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  statusTitle: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  statusText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },

  /* ─── Rows (setup + race) ─── */
  listCard: {
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowName: {
    flex: 1,
    fontSize: 15,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
  rowNameRemoved: {
    color: colors.textDim,
    textDecorationLine: 'line-through',
  },
  removedText: {
    ...typography.caption,
    color: colors.textDim,
  },

  /* ─── The clock ─── */
  clockCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  clockEvent: {
    ...typography.label,
    color: colors.textMuted,
  },
  clock: {
    fontSize: 44,
    lineHeight: 52,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
    fontVariant: ['tabular-nums'],
    marginVertical: spacing.xs,
  },
  clockHint: {
    ...typography.caption,
    color: colors.textMuted,
  },

  /* ─── Race actions ─── */
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.md,
    height: 34,
  },
  finishText: {
    fontSize: 13,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.white,
  },
  rowTime: {
    fontSize: 16,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  retryBtn: {
    backgroundColor: colors.errorDim,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.sm + 4,
    height: 30,
    justifyContent: 'center',
  },
  retryText: {
    fontSize: 12,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.error,
  },

  /* ─── Footer ─── */
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.white,
  },
});
