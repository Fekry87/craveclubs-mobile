import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
  ActionSheetIOS,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { RegistrationStackParamList } from '../../navigation/types';
import { RegistrationLayout } from '../../components/features/registration/RegistrationLayout';
import { PickerModal } from '../../components/common/PickerModal';
import { Input } from '../../components/common/Input';
import { Icon } from '../../components/common/Icon';
import { SectionLabel } from '../../components/features/registration/SectionLabel';
import { useRegistrationStore } from '../../store/registration.store';
import { useAnimatedPress } from '../../hooks/useAnimatedPress';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import {
  colors,
  spacing,
  borderRadius,
  typography,
  fontFamily,
} from '../../theme';

type Props = NativeStackScreenProps<
  RegistrationStackParamList,
  'Step1_BasicProfile'
>;

export const Step1_BasicProfile: React.FC<Props> = ({ navigation }) => {
  const { basicProfile, updateBasicProfile, setStep } = useRegistrationStore();

  // ── Local form state ───────────────────────────────────────────
  const [fullName, setFullName] = useState(basicProfile.fullName);
  const [phone, setPhone] = useState(basicProfile.phone);
  const [gender, setGender] = useState<'male' | 'female' | null>(
    basicProfile.gender,
  );
  const [birthDate, setBirthDate] = useState<string | null>(
    basicProfile.birthDate,
  );
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    basicProfile.avatarUrl,
  );
  const [guardianName, setGuardianName] = useState(
    basicProfile.guardianName,
  );
  const [guardianPhone, setGuardianPhone] = useState(
    basicProfile.guardianPhone,
  );
  const [guardianEmail, setGuardianEmail] = useState(
    basicProfile.guardianEmail,
  );
  const [guardianExpanded, setGuardianExpanded] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Date picker state ──────────────────────────────────────────
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(
    birthDate ? new Date(birthDate) : new Date(2000, 0, 15),
  );
  const tempDateRef = useRef<Date>(tempDate);

  // ── Animations ─────────────────────────────────────────────────
  const avatarEntry = useAnimatedEntry(0);
  const nameEntry = useAnimatedEntry(1);
  const phoneEntry = useAnimatedEntry(2);
  const genderEntry = useAnimatedEntry(3);
  const dobEntry = useAnimatedEntry(4);
  const guardianEntry = useAnimatedEntry(5);

  const avatarPress = useAnimatedPress();
  const malePress = useAnimatedPress();
  const femalePress = useAnimatedPress();

  // ── Avatar picker ──────────────────────────────────────────────
  const pickImage = async (source: 'camera' | 'gallery') => {
    let result: ImagePicker.ImagePickerResult;

    if (source === 'camera') {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission needed',
          'Camera access is required to take a photo.',
        );
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
    } else {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission needed',
          'Photo library access is required to choose a photo.',
        );
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
    }

    if (!result.canceled && result.assets[0]) {
      setAvatarUrl(result.assets[0].uri);
    }
  };

  const handleAvatarPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Gallery'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) pickImage('camera');
          if (buttonIndex === 2) pickImage('gallery');
        },
      );
    } else {
      Alert.alert('Profile Photo', 'Choose an option', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: () => pickImage('camera') },
        {
          text: 'Choose from Gallery',
          onPress: () => pickImage('gallery'),
        },
      ]);
    }
  };

  // ── Clear field error on change ────────────────────────────────
  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  // ── Date handling ──────────────────────────────────────────────
  const openDatePicker = useCallback(() => {
    const current = birthDate ? new Date(birthDate) : new Date(2000, 0, 15);
    setTempDate(current);
    tempDateRef.current = current;
    setShowDatePicker(true);
  }, [birthDate]);

  const onDateChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
        if (event.type === 'set' && selectedDate) {
          setBirthDate(selectedDate.toISOString());
          clearError('birthDate');
        }
      } else if (selectedDate) {
        setTempDate(selectedDate);
        tempDateRef.current = selectedDate;
      }
    },
    [clearError],
  );

  const confirmIOSDate = useCallback(() => {
    setBirthDate(tempDateRef.current.toISOString());
    setShowDatePicker(false);
    clearError('birthDate');
  }, [clearError]);

  const calculateAge = (iso: string): number => {
    return Math.floor(
      (Date.now() - new Date(iso).getTime()) /
        (365.25 * 24 * 60 * 60 * 1000),
    );
  };

  const formatDate = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Auto-expand guardian section when age < 18
  const age = birthDate ? calculateAge(birthDate) : null;
  const isMinor = age !== null && age < 18;

  React.useEffect(() => {
    if (isMinor) setGuardianExpanded(true);
  }, [isMinor]);

  // ── Validation ─────────────────────────────────────────────────
  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      errs.fullName = 'Full name is required (min 2 characters)';
    }

    if (
      !phone.replace(/\D/g, '') ||
      phone.replace(/\D/g, '').length < 10
    ) {
      errs.phone = 'Valid phone number is required';
    }

    if (!gender) {
      errs.gender = 'Please select your gender';
    }

    if (!birthDate) {
      errs.birthDate = 'Date of birth is required';
    } else {
      const age = calculateAge(birthDate);
      if (age < 5) {
        errs.birthDate = 'Swimmer must be at least 5 years old';
      }
    }

    return errs;
  };

  // ── Submit ─────────────────────────────────────────────────────
  const handleContinue = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    updateBasicProfile({
      fullName: fullName.trim(),
      phone,
      gender,
      birthDate,
      avatarUrl,
      guardianName: guardianName.trim(),
      guardianPhone: guardianPhone.trim(),
      guardianEmail: guardianEmail.trim(),
    });
    setStep(2);
    navigation.navigate('Step2_PhysicalInfo');
  };

  return (
    <RegistrationLayout
      currentStep={1}
      title="Let's get started"
      subtitle="Tell us about yourself"
      onBack={() => navigation.getParent()?.goBack()}
      ctaTitle="Continue"
      onCtaPress={handleContinue}
    >
      {/* The club isn't repeated here: the swimmer chose it on the entry
          screen, and this whole flow is already branded for it. */}

      {/* ── Photo ──────────────────────────────────────────────── */}
      <Animated.View style={[styles.avatarRow, avatarEntry]}>
        <TouchableOpacity
          onPress={handleAvatarPress}
          onPressIn={avatarPress.onPressIn}
          onPressOut={avatarPress.onPressOut}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={avatarUrl ? 'Change photo' : 'Add a photo'}
        >
          <Animated.View style={avatarPress.animatedStyle}>
            <View style={styles.avatarCircle}>
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              ) : (
                <Icon name="user-fill" size={40} color={colors.textDim} />
              )}
            </View>
            <View style={[styles.cameraBadge, { backgroundColor: colors.primary }]}>
              <Icon name="camera-fill" size={14} color={colors.white} />
            </View>
          </Animated.View>
        </TouchableOpacity>
        <Text style={[styles.avatarHint, { color: colors.primary }]} onPress={handleAvatarPress}>
          {avatarUrl ? 'Change photo' : 'Add a photo'}
        </Text>
        {!avatarUrl && <Text style={styles.optionalHint}>Optional</Text>}
      </Animated.View>

      {/* ── Name & phone ───────────────────────────────────────── */}
      <Animated.View style={nameEntry}>
        <Input
          label="Full name"
          value={fullName}
          onChangeText={(text) => {
            setFullName(text);
            clearError('fullName');
          }}
          placeholder="e.g. Laila Ahmed"
          autoCapitalize="words"
          error={errors.fullName}
        />
      </Animated.View>

      <Animated.View style={phoneEntry}>
        <Input
          label="Phone number"
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            clearError('phone');
          }}
          placeholder="e.g. 010 1234 5678"
          keyboardType="phone-pad"
          error={errors.phone}
        />
      </Animated.View>

      {/* ── Gender ─────────────────────────────────────────────── */}
      <Animated.View style={[styles.section, genderEntry]}>
        <SectionLabel>Gender</SectionLabel>
        <View style={styles.genderRow} accessibilityRole="radiogroup">
          {(
            [
              { key: 'male', label: 'Male', icon: 'men-line', press: malePress },
              { key: 'female', label: 'Female', icon: 'women-line', press: femalePress },
            ] as const
          ).map((option) => {
            const selected = gender === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                style={styles.genderCardWrapper}
                onPress={() => {
                  setGender(option.key);
                  clearError('gender');
                }}
                onPressIn={option.press.onPressIn}
                onPressOut={option.press.onPressOut}
                activeOpacity={0.8}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
              >
                <Animated.View
                  style={[
                    styles.genderCard,
                    selected && {
                      backgroundColor: colors.primaryDim,
                      borderColor: colors.primary,
                    },
                    errors.gender && !gender ? styles.fieldErrorBorder : undefined,
                    option.press.animatedStyle,
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
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
      </Animated.View>

      {/* ── Date of birth — styled as a field, like name and phone ── */}
      <Animated.View style={[styles.section, dobEntry]}>
        <TouchableOpacity
          style={[styles.dobField, errors.birthDate ? styles.fieldErrorBorder : undefined]}
          onPress={openDatePicker}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Date of birth"
        >
          <View style={styles.dobBody}>
            <Text style={styles.dobLabel}>Date of birth</Text>
            <Text style={[styles.dobValue, !birthDate && styles.dobPlaceholder]}>
              {birthDate ? formatDate(birthDate) : 'Select your date of birth'}
            </Text>
          </View>
          {birthDate ? (
            <View style={styles.agePill}>
              <Text style={styles.agePillText}>{calculateAge(birthDate)} yrs</Text>
            </View>
          ) : (
            <Icon name="calendar-event-line" size={20} color={colors.textMuted} />
          )}
        </TouchableOpacity>
        {errors.birthDate && <Text style={styles.errorText}>{errors.birthDate}</Text>}

        {/* Android date picker (renders inline) */}
        {Platform.OS === 'android' && showDatePicker && (
          <DateTimePicker
            value={birthDate ? new Date(birthDate) : new Date(2000, 0, 15)}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={onDateChange}
          />
        )}
      </Animated.View>

      {/* ── Parent or guardian ─────────────────────────────────── */}
      <Animated.View style={[styles.section, guardianEntry]}>
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
              value={guardianName}
              onChangeText={setGuardianName}
              placeholder="Parent or guardian's full name"
              autoCapitalize="words"
            />
            <Input
              label="Guardian phone"
              value={guardianPhone}
              onChangeText={setGuardianPhone}
              placeholder="e.g. 010 1234 5678"
              keyboardType="phone-pad"
            />
            <Input
              label="Guardian email (optional)"
              value={guardianEmail}
              onChangeText={setGuardianEmail}
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        )}
      </Animated.View>

      {/* ── iOS PickerModal (outside scroll content) ─────────── */}
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
    </RegistrationLayout>
  );
};

/**
 * Brand-dependent colors (primary, primaryDim) are applied inline at render
 * time so club branding shows; everything here is brand-neutral.
 */
const AVATAR_SIZE = 96;

const styles = StyleSheet.create({
  // ── Photo ───────────────────────────────────────────────────
  avatarRow: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  // Outside the clipped circle, so it can overlap the edge.
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  avatarHint: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.bodySemiBold,
    marginTop: spacing.sm + 4,
  },
  optionalHint: {
    ...typography.caption,
    color: colors.textDim,
  },

  // ── Sections ────────────────────────────────────────────────
  section: {
    marginBottom: spacing.md,
  },
  fieldErrorBorder: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: 13,
    fontFamily: fontFamily.bodyRegular,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },

  // ── Gender ──────────────────────────────────────────────────
  genderRow: {
    flexDirection: 'row',
    gap: spacing.sm + 4,
  },
  genderCardWrapper: {
    flex: 1,
  },
  genderCard: {
    minHeight: 56,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  genderLabel: {
    fontSize: 15,
    fontFamily: fontFamily.bodyMedium,
    color: colors.text,
  },

  // ── Date of birth (matches Input) ───────────────────────────
  dobField: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  dobBody: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
  },
  dobLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
    marginBottom: 2,
  },
  dobValue: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: fontFamily.bodyRegular,
    color: colors.text,
  },
  dobPlaceholder: {
    color: colors.textDim,
  },
  agePill: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
  },
  agePillText: {
    fontSize: 12,
    fontFamily: fontFamily.bodyMedium,
    color: colors.textMuted,
  },

  // ── Parent or guardian ──────────────────────────────────────
  guardianHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  guardianIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guardianText: {
    flex: 1,
  },
  guardianTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: fontFamily.bodyMedium,
    color: colors.text,
  },
  guardianSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  // Tinted pill, per the design system.
  minorBadge: {
    backgroundColor: colors.warningDim,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
  },
  minorBadgeText: {
    fontSize: 11,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.warningDark,
  },
  guardianFields: {
    marginTop: spacing.md,
  },
});
