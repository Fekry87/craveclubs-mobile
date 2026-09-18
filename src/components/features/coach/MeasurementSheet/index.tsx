import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { FormSheet } from '../../../common/FormSheet';
import { Icon } from '../../../common/Icon';
import { Button } from '../../../common/Button';
import { ChoiceChipGroup } from '../../registration/ChoiceChip';
import { SectionLabel, FieldError } from '../../registration/SectionLabel';
import { useMeasurementStore } from '../../../../store/measurement.store';
import { describeMeasurementError } from '../../../../api/services/measurement.service';
import { MeasurementInterface } from '../../../../types/models.types';
import { formatDistance, formatSwimTime } from '../../../../utils/formatters';
import { colors } from '../../../../theme';
import { styles } from './styles';

interface MeasurementSheetProps {
  visible: boolean;
  sessionId: number;
  swimmerId: number | null;
  swimmerName: string;
  /** The signed-in coach: only their own rows can be deleted. */
  coachUserId: number | null;
  onClose: () => void;
}

/** Longest time the API stores (decimal 7,2). */
const MAX_SECONDS = 99999.99;

/**
 * Digits only, as ASCII. An Arabic keyboard types ٠-٩ (and a Persian one ۰-۹);
 * dropping those would leave the field dead for most of this app's coaches.
 */
const onlyDigits = (text: string, max: number): string =>
  text
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[^0-9]/g, '')
    .slice(0, max);

/** Split elapsed milliseconds into the three fields. */
const fieldsFromMs = (ms: number): { minutes: string; seconds: string; hundredths: string } => {
  const centis = Math.floor(ms / 10);
  const minutes = Math.floor(centis / 6000);
  const seconds = Math.floor((centis - minutes * 6000) / 100);
  const hundredths = centis % 100;
  return {
    minutes: minutes > 0 ? String(minutes) : '',
    seconds: String(seconds).padStart(minutes > 0 ? 2 : 1, '0'),
    hundredths: String(hundredths).padStart(2, '0'),
  };
};

/**
 * القياس — the sheet a coach opens from a swimmer's row during a session:
 * pick the swim type and the distance (the club's own options, from the
 * portal's Skills page), enter the time or run the stopwatch, save.
 *
 * It stays open after a save, because a coach usually times the same swimmer
 * more than once; the saved time appears in the list underneath. The chosen
 * swim type and distance carry over to the next swimmer — a group swims the
 * same event one after another.
 */
export const MeasurementSheet: React.FC<MeasurementSheetProps> = ({
  visible,
  sessionId,
  swimmerId,
  swimmerName,
  coachUserId,
  onClose,
}) => {
  const options = useMeasurementStore((st) => st.options);
  const isOptionsLoading = useMeasurementStore((st) => st.isOptionsLoading);
  const optionsError = useMeasurementStore((st) => st.optionsError);
  const fetchOptions = useMeasurementStore((st) => st.fetchOptions);
  const measurements = useMeasurementStore((st) => st.measurements);
  const record = useMeasurementStore((st) => st.record);
  const remove = useMeasurementStore((st) => st.remove);

  const [strokeId, setStrokeId] = useState<string | null>(null);
  const [distanceId, setDistanceId] = useState<string | null>(null);
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [hundredths, setHundredths] = useState('');
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startedAt = useRef(0);
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTicker = useCallback(() => {
    if (ticker.current) {
      clearInterval(ticker.current);
      ticker.current = null;
    }
  }, []);

  // A fresh time for every swimmer; the event (type + distance) carries over.
  useEffect(() => {
    if (visible) {
      setMinutes('');
      setSeconds('');
      setHundredths('');
      setError(null);
      setSaving(false);
      if (!options && !isOptionsLoading) fetchOptions();
    } else {
      stopTicker();
      setRunning(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reacts to opening only
  }, [visible, swimmerId]);

  useEffect(() => stopTicker, [stopTicker]);

  const applyElapsed = useCallback(() => {
    const next = fieldsFromMs(Date.now() - startedAt.current);
    setMinutes(next.minutes);
    setSeconds(next.seconds);
    setHundredths(next.hundredths);
  }, []);

  const toggleStopwatch = useCallback(() => {
    if (running) {
      stopTicker();
      applyElapsed();
      setRunning(false);
      return;
    }
    setError(null);
    startedAt.current = Date.now();
    applyElapsed();
    ticker.current = setInterval(applyElapsed, 50);
    setRunning(true);
  }, [running, stopTicker, applyElapsed]);

  const strokeOptions = useMemo(
    () => (options?.strokes ?? []).map((s) => ({ value: String(s.id), label: s.name })),
    [options],
  );
  const distanceOptions = useMemo(
    () =>
      (options?.distances ?? []).map((d) => ({
        value: String(d.id),
        label: formatDistance(d),
      })),
    [options],
  );

  // An option chosen earlier may have been removed in the portal since.
  useEffect(() => {
    if (strokeId && !strokeOptions.some((o) => o.value === strokeId)) setStrokeId(null);
    if (distanceId && !distanceOptions.some((o) => o.value === distanceId)) setDistanceId(null);
  }, [strokeOptions, distanceOptions, strokeId, distanceId]);

  const totalSeconds =
    (Number(minutes) || 0) * 60 + (Number(seconds) || 0) + (Number(hundredths.padEnd(2, '0')) || 0) / 100;

  const swimmerRows = useMemo(
    () => measurements.filter((m) => m.swimmer_id === swimmerId),
    [measurements, swimmerId],
  );

  const handleSave = useCallback(async () => {
    if (swimmerId === null || !strokeId || !distanceId) return;
    if ((Number(seconds) || 0) >= 60) {
      setError('Seconds go up to 59 — put the rest in minutes.');
      return;
    }
    if (totalSeconds <= 0 || totalSeconds > MAX_SECONDS) {
      setError('Enter the time, or run the stopwatch.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await record(sessionId, {
        swimmer_id: swimmerId,
        stroke_skill_id: Number(strokeId),
        distance_skill_id: Number(distanceId),
        time_seconds: Math.round(totalSeconds * 100) / 100,
      });
      setMinutes('');
      setSeconds('');
      setHundredths('');
    } catch (err: unknown) {
      setError(describeMeasurementError(err));
    } finally {
      setSaving(false);
    }
  }, [swimmerId, strokeId, distanceId, seconds, totalSeconds, record, sessionId]);

  // One tap on a wet pool deck should not erase a time.
  const handleRemove = useCallback(
    (row: MeasurementInterface) => {
      Alert.alert(
        'Delete this time?',
        `${row.stroke_skill?.name ?? 'Swim'} · ${formatDistance(row.distance_skill)} — ${formatSwimTime(row.time_seconds)}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              const ok = await remove(sessionId, row.id);
              if (!ok) setError("We couldn't delete this time. Please try again.");
            },
          },
        ],
      );
    },
    [remove, sessionId],
  );

  const hasOptions = strokeOptions.length > 0 && distanceOptions.length > 0;
  const firstName = swimmerName.split(' ')[0];

  return (
    <FormSheet
      visible={visible}
      title="Record a time"
      onClose={saving ? () => undefined : onClose}
      onSave={handleSave}
      saveTitle="Save time"
      saveDisabled={!hasOptions || !strokeId || !distanceId || running || totalSeconds <= 0}
      saving={saving}
    >
      <Text style={styles.intro}>
        Time <Text style={styles.introName}>{swimmerName}</Text>'s swim. You can save
        more than one.
      </Text>

      {!options && isOptionsLoading && (
        <View style={styles.status}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      {!options && optionsError && (
        <View style={styles.status}>
          <Text style={styles.statusText}>{optionsError}</Text>
          <Button title="Try again" variant="secondary" onPress={fetchOptions} />
        </View>
      )}

      {options && !hasOptions && (
        <View style={styles.status}>
          <Icon name="timer-line" size={28} color={colors.textDim} />
          <Text style={styles.statusTitle}>
            {strokeOptions.length === 0 ? 'No swim types yet' : 'No distances yet'}
          </Text>
          <Text style={styles.statusText}>
            Your club manager adds them in the portal, under Skills (type{' '}
            {strokeOptions.length === 0 ? '"Swim Type"' : '"Distance"'}).
          </Text>
        </View>
      )}

      {options && hasOptions && (
        <>
          <SectionLabel>Swim type</SectionLabel>
          <ChoiceChipGroup options={strokeOptions} value={strokeId} onChange={setStrokeId} />

          <View style={styles.gap} />
          <SectionLabel>Distance</SectionLabel>
          <ChoiceChipGroup options={distanceOptions} value={distanceId} onChange={setDistanceId} />

          <View style={styles.gap} />
          <SectionLabel hint={totalSeconds > 0 ? formatSwimTime(totalSeconds) : undefined}>
            Time
          </SectionLabel>
          <View style={styles.timeRow}>
            <View style={styles.timeField}>
              <TextInput
                style={[styles.timeInput, running && styles.timeInputRunning]}
                value={minutes}
                onChangeText={(text) => setMinutes(onlyDigits(text, 3))}
                editable={!running}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.textDim}
                accessibilityLabel="Minutes"
              />
              <Text style={styles.timeUnit}>min</Text>
            </View>
            <Text style={styles.timeSeparator}>:</Text>
            <View style={styles.timeField}>
              <TextInput
                style={[styles.timeInput, running && styles.timeInputRunning]}
                value={seconds}
                onChangeText={(text) => setSeconds(onlyDigits(text, 2))}
                editable={!running}
                keyboardType="number-pad"
                placeholder="00"
                placeholderTextColor={colors.textDim}
                accessibilityLabel="Seconds"
              />
              <Text style={styles.timeUnit}>sec</Text>
            </View>
            <Text style={styles.timeSeparator}>.</Text>
            <View style={styles.timeField}>
              <TextInput
                style={[styles.timeInput, running && styles.timeInputRunning]}
                value={hundredths}
                onChangeText={(text) => setHundredths(onlyDigits(text, 2))}
                editable={!running}
                keyboardType="number-pad"
                placeholder="00"
                placeholderTextColor={colors.textDim}
                accessibilityLabel="Hundredths of a second"
              />
              <Text style={styles.timeUnit}>1/100</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.stopwatch,
              { backgroundColor: running ? colors.errorDim : colors.primaryDim },
            ]}
            onPress={toggleStopwatch}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <Icon
              name={running ? 'timer-fill' : 'timer-line'}
              size={18}
              color={running ? colors.error : colors.primary}
            />
            <Text style={[styles.stopwatchText, { color: running ? colors.error : colors.primary }]}>
              {running ? 'Stop' : 'Start stopwatch'}
            </Text>
          </TouchableOpacity>

          <FieldError message={error} />
        </>
      )}

      {swimmerRows.length > 0 && (
        <View style={styles.recorded}>
          <SectionLabel hint={String(swimmerRows.length)}>{`${firstName}'s times this session`}</SectionLabel>
          {swimmerRows.map((row) => (
            <View key={row.id} style={styles.recordedRow}>
              <View style={styles.recordedText}>
                <Text style={styles.recordedEvent} numberOfLines={1}>
                  {row.stroke_skill?.name ?? 'Swim'} · {formatDistance(row.distance_skill)}
                </Text>
              </View>
              <Text style={styles.recordedTime}>{formatSwimTime(row.time_seconds)}</Text>
              {row.recorded_by === coachUserId ? (
                <TouchableOpacity
                  onPress={() => handleRemove(row)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${formatSwimTime(row.time_seconds)}`}
                >
                  <Icon name="delete-bin-6-line" size={18} color={colors.textDim} />
                </TouchableOpacity>
              ) : (
                <View style={styles.recordedSpacer} />
              )}
            </View>
          ))}
        </View>
      )}
    </FormSheet>
  );
};
