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
  const { basicProfile, updateBasicProfile, setStep, clubName } =
    useRegistrationStore();

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
      {/* ── Selected Club Banner ───────────────────────────────── */}
      {clubName && (
        <View style={styles.clubBanner}>
          <Icon name="building-2-fill" size={18} color={colors.primary} />
          <Text style={styles.clubBannerText}>{clubName}</Text>
        </View>
      )}

      {/* ── Avatar ─────────────────────────────────────────────── */}
      <Animated.View style={[styles.avatarRow, avatarEntry]}>
        <TouchableOpacity
          onPress={handleAvatarPress}
          onPressIn={avatarPress.onPressIn}
          onPressOut={avatarPress.onPressOut}
          activeOpacity={0.7}
        >
          <Animated.View
            style={[styles.avatarCircle, avatarPress.animatedStyle]}
          >
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatarImage}
                contentFit="cover"
              />
            ) : (
              <Icon
                name="user-fill"
                size={36}
                color={colors.textDim}
              />
            )}
            <View style={styles.cameraBadge}>
              <Icon
                name="camera-fill"
                size={12}
                color={colors.white}
              />
            </View>
          </Animated.View>
        </TouchableOpacity>
        <Text style={styles.avatarHint}>Tap to add photo</Text>
      </Animated.View>

      {/* ── Form Card ──────────────────────────────────────────── */}
      <View style={styles.formCard}>
        {/* Full Name */}
        <Animated.View style={nameEntry}>
          <Input
            label="Full Name"
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              clearError('fullName');
            }}
            placeholder="Full name"
            autoCapitalize="words"
            error={errors.fullName}
          />
        </Animated.View>

        {/* Phone */}
        <Animated.View style={phoneEntry}>
          <Input
            label="Phone Number"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              clearError('phone');
            }}
            placeholder="Phone number"
            keyboardType="phone-pad"
            error={errors.phone}
          />
        </Animated.View>
      </View>

      {/* ── Gender ─────────────────────────────────────────────── */}
      <Animated.View style={[styles.genderSection, genderEntry]}>
        <Text style={styles.fieldLabel}>Gender</Text>
        <View style={styles.genderRow}>
          {/* Male card */}
          <TouchableOpacity
            style={styles.genderCardWrapper}
            onPress={() => {
              setGender('male');
              clearError('gender');
            }}
            onPressIn={malePress.onPressIn}
            onPressOut={malePress.onPressOut}
            activeOpacity={0.7}
          >
            <Animated.View
              style={[
                styles.genderCard,
                gender === 'male'
                  ? styles.genderCardSelected
                  : styles.genderCardUnselected,
                malePress.animatedStyle,
              ]}
            >
              <Icon
                name="men-line"
                size={22}
                color={
                  gender === 'male' ? colors.primary : colors.textMuted
                }
              />
              <Text
                style={[
                  styles.genderLabel,
                  gender === 'male' && styles.genderLabelSelected,
                ]}
              >
                Male
              </Text>
            </Animated.View>
          </TouchableOpacity>

          {/* Female card */}
          <TouchableOpacity
            style={styles.genderCardWrapper}
            onPress={() => {
              setGender('female');
              clearError('gender');
            }}
            onPressIn={femalePress.onPressIn}
            onPressOut={femalePress.onPressOut}
            activeOpacity={0.7}
          >
            <Animated.View
              style={[
                styles.genderCard,
                gender === 'female'
                  ? styles.genderCardSelected
                  : styles.genderCardUnselected,
                femalePress.animatedStyle,
              ]}
            >
              <Icon
                name="women-line"
                size={22}
                color={
                  gender === 'female'
                    ? colors.primary
                    : colors.textMuted
                }
              />
              <Text
                style={[
                  styles.genderLabel,
                  gender === 'female' && styles.genderLabelSelected,
                ]}
              >
                Female
              </Text>
            </Animated.View>
          </TouchableOpacity>
        </View>
        {errors.gender && (
          <Text style={styles.errorText}>{errors.gender}</Text>
        )}
      </Animated.View>

      {/* ── Date of Birth ──────────────────────────────────────── */}
      <Animated.View style={[styles.dobSection, dobEntry]}>
        <Text style={styles.fieldLabel}>Date of Birth</Text>
        <TouchableOpacity
          style={[
            styles.dobRow,
            errors.birthDate ? styles.dobRowError : undefined,
          ]}
          onPress={openDatePicker}
          activeOpacity={0.7}
        >
          <Icon
            name="calendar-event-line"
            size={22}
            color={birthDate ? colors.primary : colors.textDim}
          />
          <Text
            style={[
              styles.dobText,
              !birthDate && styles.dobPlaceholder,
            ]}
          >
            {birthDate ? formatDate(birthDate) : 'Select date of birth'}
          </Text>
        </TouchableOpacity>
        {birthDate && (
          <Text style={styles.ageText}>
            Age: {calculateAge(birthDate)} years
          </Text>
        )}
        {errors.birthDate && (
          <Text style={styles.errorText}>{errors.birthDate}</Text>
        )}

        {/* Android date picker (renders inline) */}
        {Platform.OS === 'android' && showDatePicker && (
          <DateTimePicker
            value={
              birthDate ? new Date(birthDate) : new Date(2000, 0, 15)
            }
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={onDateChange}
          />
        )}
      </Animated.View>

      {/* ── Guardian Info (for minors) ──────────────────────── */}
      <Animated.View style={[styles.guardianSection, guardianEntry]}>
        <TouchableOpacity
          style={styles.guardianHeader}
          onPress={() => setGuardianExpanded((v) => !v)}
          activeOpacity={0.7}
        >
          <View style={styles.guardianHeaderLeft}>
            <Icon
              name="hand-heart-fill"
              size={18}
              color={colors.secondary}
            />
            <Text style={styles.guardianTitle}>Guardian Info</Text>
            {isMinor && (
              <View style={styles.minorBadge}>
                <Text style={styles.minorBadgeText}>Under 18</Text>
              </View>
            )}
          </View>
          <Icon
            name={guardianExpanded ? 'arrow-up-s-line' : 'arrow-down-s-line'}
            size={20}
            color={colors.textMuted}
          />
        </TouchableOpacity>

        {guardianExpanded && (
          <View style={styles.guardianFields}>
            <Input
              label="Guardian Name"
              value={guardianName}
              onChangeText={setGuardianName}
              placeholder="Parent or guardian name"
              autoCapitalize="words"
            />
            <Input
              label="Guardian Phone"
              value={guardianPhone}
              onChangeText={setGuardianPhone}
              placeholder="Guardian phone number"
              keyboardType="phone-pad"
            />
            <Input
              label="Guardian Email"
              value={guardianEmail}
              onChangeText={setGuardianEmail}
              placeholder="Guardian email (optional)"
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

const styles = StyleSheet.create({
  // ── Club Banner ───────────────────────────────────────────────
  clubBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryDim,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  clubBannerText: {
    ...typography.bodyMedium,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.primary,
  },

  // ── Avatar ──────────────────────────────────────────────────
  avatarRow: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.pill,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarHint: {
    ...typography.caption,
    color: colors.textDim,
    marginTop: spacing.xs,
  },

  // ── Form Card ────────────────────────────────────────────────
  formCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },

  // ── Field label ─────────────────────────────────────────────
  fieldLabel: {
    fontSize: 13,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ── Gender ──────────────────────────────────────────────────
  genderSection: {
    marginBottom: spacing.md,
  },
  genderRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  genderCardWrapper: {
    flex: 1,
  },
  genderCard: {
    height: 52,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 2,
  },
  genderCardUnselected: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  genderCardSelected: {
    backgroundColor: colors.primaryDim,
    borderColor: colors.primary,
  },
  genderLabel: {
    fontSize: 15,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
  },
  genderLabelSelected: {
    color: colors.primary,
  },

  // ── Date of Birth ───────────────────────────────────────────
  dobSection: {
    marginBottom: spacing.sm,
  },
  dobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  dobRowError: {
    borderColor: colors.error,
  },
  dobText: {
    flex: 1,
    fontSize: 16,
    fontFamily: fontFamily.bodyRegular,
    color: colors.text,
  },
  dobPlaceholder: {
    color: colors.textDim,
  },
  ageText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },

  // ── Error text ──────────────────────────────────────────────
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },

  // ── Guardian section ──────────────────────────────────────
  guardianSection: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  guardianHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.secondaryDim,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.secondary + '30',
  },
  guardianHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  guardianTitle: {
    fontSize: 14,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
  minorBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  minorBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
  guardianFields: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    marginTop: spacing.sm,
  },

});
