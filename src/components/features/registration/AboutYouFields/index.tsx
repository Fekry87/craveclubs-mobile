import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Input } from '../../../common/Input';
import { Icon } from '../../../common/Icon';
import { PickerModal } from '../../../common/PickerModal';
import { SectionLabel, FieldError } from '../SectionLabel';
import {
  AboutYouValues,
  FieldErrors,
  ageFromBirthDate,
} from '../../../../utils/registrationValidation';
import { colors } from '../../../../theme';
import { styles } from './styles';

interface AboutYouFieldsProps {
  value: AboutYouValues;
  onChange: (patch: Partial<AboutYouValues>) => void;
  errors: FieldErrors;
}

const DEFAULT_BIRTH_DATE = new Date(2000, 0, 15);

const formatBirthDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const GENDERS = [
  { key: 'male', label: 'Male', icon: 'men-line' },
  { key: 'female', label: 'Female', icon: 'women-line' },
] as const;

/**
 * Name, phone, gender, date of birth and guardian — Step 1's questions, also
 * used by the review screen's edit sheet. Controlled: the parent owns the
 * answers and the errors (see utils/registrationValidation).
 */
export const AboutYouFields: React.FC<AboutYouFieldsProps> = ({
  value,
  onChange,
  errors,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(DEFAULT_BIRTH_DATE);
  const tempDateRef = useRef<Date>(DEFAULT_BIRTH_DATE);

  const age = value.birthDate ? ageFromBirthDate(value.birthDate) : null;
  const isMinor = age !== null && age < 18;
  const hasGuardian = !!(value.guardianName || value.guardianPhone || value.guardianEmail);
  const [guardianExpanded, setGuardianExpanded] = useState(isMinor || hasGuardian);

  // A birth date that makes the swimmer a minor opens the guardian section.
  useEffect(() => {
    if (isMinor) setGuardianExpanded(true);
  }, [isMinor]);

  const openDatePicker = useCallback(() => {
    const current = value.birthDate ? new Date(value.birthDate) : DEFAULT_BIRTH_DATE;
    setTempDate(current);
    tempDateRef.current = current;
    setShowDatePicker(true);
  }, [value.birthDate]);

  const onDateChange = useCallback(
    (event: DateTimePickerEvent, selected?: Date) => {
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
        if (event.type === 'set' && selected) {
          onChange({ birthDate: selected.toISOString() });
        }
      } else if (selected) {
        setTempDate(selected);
        tempDateRef.current = selected;
      }
    },
    [onChange],
  );

  const confirmIOSDate = useCallback(() => {
    onChange({ birthDate: tempDateRef.current.toISOString() });
    setShowDatePicker(false);
  }, [onChange]);

  return (
    <View>
      <Input
        label="Full name"
        value={value.fullName}
        onChangeText={(fullName) => onChange({ fullName })}
        placeholder="e.g. Laila Ahmed"
        autoCapitalize="words"
        error={errors.fullName}
      />
      <Input
        label="Phone number"
        value={value.phone}
        onChangeText={(phone) => onChange({ phone })}
        placeholder="e.g. 010 1234 5678"
        keyboardType="phone-pad"
        error={errors.phone}
      />
      {/* Becomes the login address once the club approves; the phone works too. */}
      <Input
        label="Email"
        value={value.email}
        onChangeText={(email) => onChange({ email })}
        placeholder="name@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />

      {/* ── Gender ─────────────────────────────────────────────── */}
      <View style={styles.section}>
        <SectionLabel>Gender</SectionLabel>
        <View style={styles.genderRow} accessibilityRole="radiogroup">
          {GENDERS.map((option) => {
            const selected = value.gender === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                style={styles.genderCardWrapper}
                onPress={() => onChange({ gender: option.key })}
                activeOpacity={0.8}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
              >
                <View
                  style={[
                    styles.genderCard,
                    errors.gender && !value.gender ? styles.fieldErrorBorder : undefined,
                    selected && {
                      backgroundColor: colors.primaryDim,
                      borderColor: colors.primary,
                    },
                  ]}
                >
                  <Icon
                    name={option.icon}
                    size={20}
                    color={selected ? colors.primary : colors.textMuted}
                  />
                  <Text style={[styles.genderLabel, selected && { color: colors.primary }]}>
                    {option.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        <FieldError message={errors.gender} />
      </View>

      {/* ── Date of birth — styled as a field ──────────────────── */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.dobField, errors.birthDate ? styles.fieldErrorBorder : undefined]}
          onPress={openDatePicker}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Date of birth"
        >
          <View style={styles.dobBody}>
            <Text style={styles.dobLabel}>Date of birth</Text>
            <Text style={[styles.dobValue, !value.birthDate && styles.dobPlaceholder]}>
              {value.birthDate ? formatBirthDate(value.birthDate) : 'Select your date of birth'}
            </Text>
          </View>
          {age !== null ? (
            <View style={styles.agePill}>
              <Text style={styles.agePillText}>{age} yrs</Text>
            </View>
          ) : (
            <Icon name="calendar-event-line" size={20} color={colors.textMuted} />
          )}
        </TouchableOpacity>
        <FieldError message={errors.birthDate} />

        {Platform.OS === 'android' && showDatePicker && (
          <DateTimePicker
            value={value.birthDate ? new Date(value.birthDate) : DEFAULT_BIRTH_DATE}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={onDateChange}
          />
        )}
      </View>

      {/* ── Parent or guardian ─────────────────────────────────── */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.guardianHeader}
          onPress={() => setGuardianExpanded((v) => !v)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityState={{ expanded: guardianExpanded }}
        >
          <View style={[styles.guardianIcon, { backgroundColor: colors.primaryDim }]}>
            <Icon name="hand-heart-line" size={18} color={colors.primary} />
          </View>
          <View style={styles.guardianText}>
            <Text style={styles.guardianTitle}>Parent or guardian</Text>
            <Text style={styles.guardianSubtitle}>
              {isMinor ? 'Needed for swimmers under 18' : 'Optional'}
            </Text>
          </View>
          {isMinor && (
            <View style={styles.minorBadge}>
              <Text style={styles.minorBadgeText}>Under 18</Text>
            </View>
          )}
          <Icon
            name={guardianExpanded ? 'arrow-up-s-line' : 'arrow-down-s-line'}
            size={20}
            color={colors.textMuted}
          />
        </TouchableOpacity>

        {guardianExpanded && (
          <View style={styles.guardianFields}>
            <Input
              label="Guardian name"
              value={value.guardianName}
              onChangeText={(guardianName) => onChange({ guardianName })}
              placeholder="Parent or guardian's full name"
              autoCapitalize="words"
            />
            <Input
              label="Guardian phone"
              value={value.guardianPhone}
              onChangeText={(guardianPhone) => onChange({ guardianPhone })}
              placeholder="e.g. 010 1234 5678"
              keyboardType="phone-pad"
            />
            <Input
              label="Guardian email (optional)"
              value={value.guardianEmail}
              onChangeText={(guardianEmail) => onChange({ guardianEmail })}
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        )}
      </View>

      {/* iOS date picker sheet */}
      <PickerModal
        visible={showDatePicker}
        title="Date of Birth"
        icon="cake-2-fill"
        accentColor={colors.primary}
        accentDim={colors.primaryDim}
        mode="date"
        value={tempDate}
        onChange={onDateChange}
        onDone={confirmIOSDate}
        onCancel={() => setShowDatePicker(false)}
      />
    </View>
  );
};
