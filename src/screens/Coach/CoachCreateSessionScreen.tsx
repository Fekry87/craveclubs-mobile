import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { Icon, IconName } from '../../components/common/Icon';
import { PickerModal } from '../../components/common/PickerModal';
import { useCoachStore } from '../../store/coach.store';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import { CoachSessionsStackParamList } from '../../navigation/types';
import {
  SessionCreatePayload,
  SwimmerProfileInterface,
  CoachGroupInterface,
} from '../../types/models.types';
import {
  colors,
  spacing,
  fontFamily,
  borderRadius,
  shadows,
} from '../../theme';

/* ── Types ── */

type Props = NativeStackScreenProps<
  CoachSessionsStackParamList,
  'CoachCreateSession'
>;

const SESSION_TYPES = [
  'General',
  'Technique',
  'Endurance',
  'Speed',
  'Test',
  'Recovery',
  'Custom',
] as const;

type SessionType = (typeof SESSION_TYPES)[number];

/* ── Formatting Helpers ── */

const formatDisplayDate = (d: Date): string => {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

const formatDisplayTime = (d: Date): string => {
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${String(minutes).padStart(2, '0')} ${ampm}`;
};

const toDateString = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const toTimeString = (d: Date): string => {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

const getInitialStartTime = (): Date => {
  const d = new Date();
  d.setHours(10, 0, 0, 0);
  return d;
};

const getInitialEndTime = (): Date => {
  const d = new Date();
  d.setHours(11, 0, 0, 0);
  return d;
};

/* ── Section Header Component ── */

interface SectionHeaderProps {
  icon: IconName;
  iconColor: string;
  iconBg: string;
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  iconColor,
  iconBg,
  title,
}) => (
  <View style={s.sectionHeader}>
    <View style={[s.sectionIconCircle, { backgroundColor: iconBg }]}>
      <Icon name={icon} size={14} color={iconColor} />
    </View>
    <Text style={s.sectionTitle}>{title}</Text>
  </View>
);

/* ── Field Label Component ── */

interface FieldLabelProps {
  text: string;
  required?: boolean;
}

const FieldLabel: React.FC<FieldLabelProps> = ({ text, required = false }) => (
  <Text style={s.fieldLabel}>
    {text}
    {required && <Text style={s.requiredStar}> *</Text>}
  </Text>
);

/* ── Swimmer Chip Component ── */

interface SwimmerChipProps {
  swimmer: SwimmerProfileInterface;
}

const SwimmerChip: React.FC<SwimmerChipProps> = ({ swimmer }) => {
  const initials = `${swimmer.first_name.charAt(0)}${swimmer.last_name.charAt(0)}`.toUpperCase();

  return (
    <View style={s.swimmerChip}>
      <View style={s.swimmerChipAvatar}>
        <Text style={s.swimmerChipInitials}>{initials}</Text>
      </View>
      <Text style={s.swimmerChipName} numberOfLines={1}>
        {swimmer.first_name}
      </Text>
    </View>
  );
};

/* ── Animated Section Wrapper ── */

interface AnimatedSectionProps {
  index: number;
  children: React.ReactNode;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  index,
  children,
}) => {
  const animStyle = useAnimatedEntry(index);

  return (
    <Animated.View style={animStyle}>
      {children}
    </Animated.View>
  );
};

/* ══════════════════════════════════════════════════════════════
   CoachCreateSessionScreen
   ══════════════════════════════════════════════════════════════ */

export const CoachCreateSessionScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const {
    groups,
    isGroupsLoading,
    fetchGroups,
    createSession,
    isCreating,
  } = useCoachStore();

  /* ── Form state ── */
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<SessionType>('General');
  const [title, setTitle] = useState('');
  const [dateObj, setDateObj] = useState<Date>(() => new Date());
  const [startTimeObj, setStartTimeObj] = useState<Date>(getInitialStartTime);
  const [endTimeObj, setEndTimeObj] = useState<Date>(getInitialEndTime);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  /* ── Picker visibility state ── */
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  /* ── iOS temp picker values ── */
  const [tempDate, setTempDate] = useState<Date>(() => new Date());
  const [tempStartTime, setTempStartTime] = useState<Date>(getInitialStartTime);
  const [tempEndTime, setTempEndTime] = useState<Date>(getInitialEndTime);

  /* ── Refs to avoid stale closures in Done handlers ── */
  const tempDateRef = useRef<Date>(tempDate);
  const tempStartTimeRef = useRef<Date>(tempStartTime);
  const tempEndTimeRef = useRef<Date>(tempEndTime);

  /* ── Derived values ── */
  const dateString = useMemo(() => toDateString(dateObj), [dateObj]);
  const startTimeString = useMemo(() => toTimeString(startTimeObj), [startTimeObj]);
  const endTimeString = useMemo(() => toTimeString(endTimeObj), [endTimeObj]);

  const selectedGroup: CoachGroupInterface | undefined = useMemo(
    () => (groups ?? []).find((g) => g.id === selectedGroupId),
    [groups, selectedGroupId],
  );

  const groupSwimmers: SwimmerProfileInterface[] = useMemo(
    () => selectedGroup?.swimmers ?? [],
    [selectedGroup],
  );

  /* ── Fetch groups on mount ── */
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  /* ── Date Picker Handlers ── */

  const handleOpenDatePicker = useCallback(() => {
    const current = dateObj;
    setTempDate(current);
    tempDateRef.current = current;
    setShowDatePicker(true);
  }, [dateObj]);

  const handleDateChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
        if (event.type === 'set' && selectedDate) {
          setDateObj(selectedDate);
        }
      } else {
        if (selectedDate) {
          tempDateRef.current = selectedDate;
          setTempDate(selectedDate);
        }
      }
    },
    [],
  );

  const handleDateDone = useCallback(() => {
    setDateObj(tempDateRef.current);
    setShowDatePicker(false);
  }, []);

  /* ── Start Time Picker Handlers ── */

  const handleOpenStartTimePicker = useCallback(() => {
    const current = startTimeObj;
    setTempStartTime(current);
    tempStartTimeRef.current = current;
    setShowStartTimePicker(true);
  }, [startTimeObj]);

  const handleStartTimeChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        setShowStartTimePicker(false);
        if (event.type === 'set' && selectedDate) {
          setStartTimeObj(selectedDate);
        }
      } else {
        if (selectedDate) {
          tempStartTimeRef.current = selectedDate;
          setTempStartTime(selectedDate);
        }
      }
    },
    [],
  );

  const handleStartTimeDone = useCallback(() => {
    setStartTimeObj(tempStartTimeRef.current);
    setShowStartTimePicker(false);
  }, []);

  /* ── End Time Picker Handlers ── */

  const handleOpenEndTimePicker = useCallback(() => {
    const current = endTimeObj;
    setTempEndTime(current);
    tempEndTimeRef.current = current;
    setShowEndTimePicker(true);
  }, [endTimeObj]);

  const handleEndTimeChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        setShowEndTimePicker(false);
        if (event.type === 'set' && selectedDate) {
          setEndTimeObj(selectedDate);
        }
      } else {
        if (selectedDate) {
          tempEndTimeRef.current = selectedDate;
          setTempEndTime(selectedDate);
        }
      }
    },
    [],
  );

  const handleEndTimeDone = useCallback(() => {
    setEndTimeObj(tempEndTimeRef.current);
    setShowEndTimePicker(false);
  }, []);

  /* ── Validation ── */
  const validate = useCallback((): string | null => {
    if (!selectedGroupId) return 'Please select a group.';
    if (startTimeString >= endTimeString) {
      return 'End time must be after start time.';
    }
    return null;
  }, [selectedGroupId, startTimeString, endTimeString]);

  /* ── Submit ── */
  const handleSubmit = useCallback(async () => {
    const error = validate();
    if (error) {
      Alert.alert('Missing Information', error);
      return;
    }

    const payload: SessionCreatePayload = {
      group_id: selectedGroupId!,
      date: dateString,
      start_time: startTimeString,
      end_time: endTimeString,
      ...(title.trim() ? { title: title.trim() } : {}),
      ...(selectedType !== 'General' ? { type: selectedType } : {}),
      ...(location.trim() ? { location: location.trim() } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    };

    const result = await createSession(payload);
    if (result) {
      Alert.alert('Session Created', 'Your new session has been scheduled.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Error', 'Failed to create session. Please try again.');
    }
  }, [
    validate,
    selectedGroupId,
    dateString,
    startTimeString,
    endTimeString,
    title,
    selectedType,
    location,
    notes,
    createSession,
    navigation,
  ]);

  /* ── Loading state for groups ── */
  if (isGroupsLoading && (!groups || groups.length === 0)) {
    return <Loader message="Loading groups..." />;
  }

  return (
    <View style={s.outerContainer}>
      <KeyboardAvoidingView
        style={s.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          style={s.container}
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ══ 1. GROUP SELECTION ══ */}
          <AnimatedSection index={0}>
            <SectionHeader
              icon="group-fill"
              iconColor={colors.primary}
              iconBg={colors.primaryDim}
              title="Select Group"
            />
            <Card>
              <View>
                <FieldLabel text="Group" required />

                {!groups || groups.length === 0 ? (
                  <EmptyState
                    icon="group-line"
                    title="No Groups"
                    message="You don't have any groups assigned yet."
                  />
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={s.pillRow}
                  >
                    {groups.map((group) => {
                      const isSelected = selectedGroupId === group.id;
                      return (
                        <TouchableOpacity
                          key={group.id}
                          style={[
                            s.pill,
                            isSelected ? s.pillSelected : s.pillUnselected,
                            isSelected && shadows.sm,
                          ]}
                          onPress={() => setSelectedGroupId(group.id)}
                          activeOpacity={0.7}
                        >
                          <Icon
                            name="group-line"
                            size={14}
                            color={isSelected ? colors.white : colors.textMuted}
                          />
                          <Text
                            style={[
                              s.pillText,
                              isSelected
                                ? s.pillTextSelected
                                : s.pillTextUnselected,
                            ]}
                            numberOfLines={1}
                          >
                            {group.name}
                          </Text>
                          {isSelected && group.swimmers_count > 0 && (
                            <View style={s.pillBadge}>
                              <Text style={s.pillBadgeText}>
                                {group.swimmers_count}
                              </Text>
                            </View>
                          )}
                          {isSelected && (
                            <View style={s.pillCheck}>
                              <Icon
                                name="check-line"
                                size={12}
                                color={colors.white}
                              />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}

                {/* ── Swimmers in selected group ── */}
                {selectedGroupId !== null && (
                  <View style={s.swimmersSection}>
                    <View style={s.swimmersSectionHeader}>
                      <Icon
                        name="user-fill"
                        size={14}
                        color={colors.primary}
                      />
                      <Text style={s.swimmersSectionTitle}>
                        Swimmers
                        {groupSwimmers.length > 0 &&
                          ` (${groupSwimmers.length})`}
                      </Text>
                    </View>
                    {groupSwimmers.length === 0 ? (
                      <Text style={s.swimmersEmpty}>
                        No swimmers in this group
                      </Text>
                    ) : (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={s.swimmersRow}
                      >
                        {groupSwimmers.map((swimmer) => (
                          <SwimmerChip key={swimmer.id} swimmer={swimmer} />
                        ))}
                      </ScrollView>
                    )}
                  </View>
                )}
              </View>
            </Card>
          </AnimatedSection>

          {/* ══ 2. SESSION TYPE ══ */}
          <AnimatedSection index={1}>
            <SectionHeader
              icon="clipboard-fill"
              iconColor={colors.swimmer}
              iconBg={colors.swimmerDim}
              title="Session Type"
            />
            <Card>
              <View>
                <FieldLabel text="Type" />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.pillRow}
                >
                  {SESSION_TYPES.map((type) => {
                    const isSelected = selectedType === type;
                    return (
                      <TouchableOpacity
                        key={type}
                        style={[
                          s.pill,
                          isSelected
                            ? s.pillTypeSelected
                            : s.pillUnselected,
                          isSelected && shadows.sm,
                        ]}
                        onPress={() => setSelectedType(type)}
                        activeOpacity={0.7}
                      >
                        {isSelected && (
                          <Icon
                            name="check-line"
                            size={14}
                            color={colors.white}
                          />
                        )}
                        <Text
                          style={[
                            s.pillText,
                            isSelected
                              ? s.pillTextSelected
                              : s.pillTextUnselected,
                          ]}
                        >
                          {type}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </Card>
          </AnimatedSection>

          {/* ══ 3. SESSION DETAILS ══ */}
          <AnimatedSection index={2}>
            <SectionHeader
              icon="edit-fill"
              iconColor={colors.orange}
              iconBg={colors.orangeDim}
              title="Session Details"
            />
            <Card>
              <View>
                {/* Title */}
                <View style={s.fieldGroup}>
                  <FieldLabel text="Title" />
                  <View style={s.inputWithIcon}>
                    <View style={s.inputIconLeft}>
                      <View style={[s.inputIconCircle, { backgroundColor: colors.secondaryDim }]}>
                        <Icon
                          name="file-list-fill"
                          size={14}
                          color={colors.secondary}
                        />
                      </View>
                    </View>
                    <TextInput
                      style={[s.textInput, s.textInputWithIcon]}
                      value={title}
                      onChangeText={setTitle}
                      placeholder="Session title (optional)"
                      placeholderTextColor={colors.textDim}
                    />
                  </View>
                </View>

                {/* Date */}
                <View style={s.fieldGroup}>
                  <FieldLabel text="Date" required />
                  <TouchableOpacity
                    style={s.pickerButton}
                    onPress={handleOpenDatePicker}
                    activeOpacity={0.7}
                  >
                    <View style={[s.inputIconCircle, { backgroundColor: colors.primaryDim }]}>
                      <Icon
                        name="calendar-event-fill"
                        size={14}
                        color={colors.primary}
                      />
                    </View>
                    <Text style={s.pickerButtonText}>
                      {formatDisplayDate(dateObj)}
                    </Text>
                    <Icon
                      name="arrow-right-s-line"
                      size={18}
                      color={colors.textDim}
                    />
                  </TouchableOpacity>
                </View>

                {/* Time Row */}
                <View style={s.timeRow}>
                  <View style={s.timeField}>
                    <FieldLabel text="Start Time" required />
                    <TouchableOpacity
                      style={s.pickerButton}
                      onPress={handleOpenStartTimePicker}
                      activeOpacity={0.7}
                    >
                      <View style={[s.inputIconCircle, { backgroundColor: colors.swimmerDim }]}>
                        <Icon
                          name="time-fill"
                          size={14}
                          color={colors.swimmer}
                        />
                      </View>
                      <Text style={s.pickerButtonText}>
                        {formatDisplayTime(startTimeObj)}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={s.timeSeparator}>
                    <Icon
                      name="arrow-right-s-line"
                      size={20}
                      color={colors.textDim}
                    />
                  </View>

                  <View style={s.timeField}>
                    <FieldLabel text="End Time" required />
                    <TouchableOpacity
                      style={s.pickerButton}
                      onPress={handleOpenEndTimePicker}
                      activeOpacity={0.7}
                    >
                      <View style={[s.inputIconCircle, { backgroundColor: colors.orangeDim }]}>
                        <Icon
                          name="time-fill"
                          size={14}
                          color={colors.orange}
                        />
                      </View>
                      <Text style={s.pickerButtonText}>
                        {formatDisplayTime(endTimeObj)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Location */}
                <View style={s.fieldGroup}>
                  <FieldLabel text="Location" />
                  <View style={s.inputWithIcon}>
                    <View style={s.inputIconLeft}>
                      <View style={[s.inputIconCircle, { backgroundColor: colors.secondaryDim }]}>
                        <Icon
                          name="map-pin-fill"
                          size={14}
                          color={colors.secondary}
                        />
                      </View>
                    </View>
                    <TextInput
                      style={[s.textInput, s.textInputWithIcon]}
                      value={location}
                      onChangeText={setLocation}
                      placeholder="Pool / Training Location"
                      placeholderTextColor={colors.textDim}
                    />
                  </View>
                </View>

                {/* Notes */}
                <View style={s.fieldGroupLast}>
                  <FieldLabel text="Notes" />
                  <TextInput
                    style={[s.textInput, s.textInputMultiline]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Session notes..."
                    placeholderTextColor={colors.textDim}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </Card>
          </AnimatedSection>

        </ScrollView>

        {/* ══ STICKY FOOTER ══ */}
        <View style={[s.stickyFooter, { paddingBottom: Math.max(spacing.sm, insets.bottom) }]}>
          <Button
            title="Create Session"
            variant="primary"
            onPress={handleSubmit}
            loading={isCreating}
            disabled={isCreating}
          />
        </View>
      </KeyboardAvoidingView>

      {/* ══ iOS PICKER MODALS ══ */}
      <PickerModal
        visible={showDatePicker}
        title="Select Date"
        icon="calendar-event-fill"
        accentColor={colors.primary}
        accentDim={colors.primaryDim}
        mode="date"
        value={tempDate}
        minimumDate={new Date()}
        onChange={handleDateChange}
        onDone={handleDateDone}
        onCancel={() => setShowDatePicker(false)}
      />

      <PickerModal
        visible={showStartTimePicker}
        title="Start Time"
        icon="time-fill"
        accentColor={colors.swimmer}
        accentDim={colors.swimmerDim}
        mode="time"
        value={tempStartTime}
        onChange={handleStartTimeChange}
        onDone={handleStartTimeDone}
        onCancel={() => setShowStartTimePicker(false)}
      />

      <PickerModal
        visible={showEndTimePicker}
        title="End Time"
        icon="time-fill"
        accentColor={colors.orange}
        accentDim={colors.orangeDim}
        mode="time"
        value={tempEndTime}
        onChange={handleEndTimeChange}
        onDone={handleEndTimeDone}
        onCancel={() => setShowEndTimePicker(false)}
      />

      {/* ══ ANDROID PICKERS (render inline, auto-show as native dialog) ══ */}
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={dateObj}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {Platform.OS === 'android' && showStartTimePicker && (
        <DateTimePicker
          value={startTimeObj}
          mode="time"
          display="default"
          is24Hour={false}
          onChange={handleStartTimeChange}
        />
      )}

      {Platform.OS === 'android' && showEndTimePicker && (
        <DateTimePicker
          value={endTimeObj}
          mode="time"
          display="default"
          is24Hour={false}
          onChange={handleEndTimeChange}
        />
      )}
    </View>
  );
};

/* ══════════════════════════════════════════════════════════════
   Styles
   ══════════════════════════════════════════════════════════════ */

const s = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex1: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },

  /* ── Section Headers ── */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
  },

  /* ── Field Labels ── */
  fieldLabel: {
    fontSize: 12,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  requiredStar: {
    fontSize: 12,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.error,
  },

  /* ── Field Groups ── */
  fieldGroup: {
    marginBottom: spacing.md,
  },
  fieldGroupLast: {
    marginBottom: 0,
  },

  /* ── Pill Selectors ── */
  pillRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.pill,
    borderWidth: 2,
  },
  pillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  pillTypeSelected: {
    backgroundColor: colors.swimmer,
    borderColor: colors.swimmerDark,
  },
  pillUnselected: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
  },
  pillText: {
    fontSize: 13,
    fontFamily: fontFamily.bodySemiBold,
  },
  pillTextSelected: {
    color: colors.white,
  },
  pillTextUnselected: {
    color: colors.textMuted,
  },
  pillCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  pillBadgeText: {
    fontSize: 11,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.white,
  },

  /* ── Swimmers Section ── */
  swimmersSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  swimmersSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  swimmersSectionTitle: {
    fontSize: 13,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
  swimmersRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  swimmersEmpty: {
    fontSize: 13,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textDim,
    paddingVertical: spacing.sm,
  },
  swimmerChip: {
    alignItems: 'center',
    gap: spacing.xs,
    width: 60,
  },
  swimmerChipAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swimmerChipInitials: {
    fontSize: 13,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.primary,
  },
  swimmerChipName: {
    fontSize: 11,
    fontFamily: fontFamily.bodyMedium,
    color: colors.text,
    textAlign: 'center',
  },

  /* ── Text Inputs ── */
  textInput: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    fontFamily: fontFamily.bodyRegular,
    color: colors.text,
  },
  textInputWithIcon: {
    paddingLeft: spacing.xl + spacing.md,
  },
  textInputMultiline: {
    minHeight: 80,
    paddingTop: spacing.sm + 2,
    textAlignVertical: 'top',
  },

  /* ── Input with left icon ── */
  inputWithIcon: {
    position: 'relative',
  },
  inputIconLeft: {
    position: 'absolute',
    left: spacing.sm + 2,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 1,
  },
  inputIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.secondaryDim,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── Picker Button (tappable date/time fields) ── */
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
  },
  pickerButtonText: {
    flex: 1,
    fontSize: 15,
    fontFamily: fontFamily.bodyMedium,
    color: colors.text,
  },

  /* ── Time Row ── */
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  timeField: {
    flex: 1,
  },
  timeSeparator: {
    paddingBottom: spacing.sm + 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── Sticky Footer ── */
  stickyFooter: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
