import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { RegistrationStackParamList } from '../../navigation/types';
import { RegistrationLayout } from '../../components/features/registration/RegistrationLayout';
import { AboutYouFields } from '../../components/features/registration/AboutYouFields';
import { Icon } from '../../components/common/Icon';
import { useRegistrationStore } from '../../store/registration.store';
import { checkEmailAvailability } from '../../api/services/registration.service';
import { useAnimatedPress } from '../../hooks/useAnimatedPress';
import { useFormAnswers } from '../../hooks/useFormAnswers';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import { pickProfilePhoto, showPhotoMenu } from '../../utils/photo';
import {
  AboutYouValues,
  aboutFromStore,
  cleanAboutYou,
  validateAboutYou,
} from '../../utils/registrationValidation';
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

  // ── Local answers (rehydrated from the store) ──────────────────
  const { answers, errors, handleChange, validate, setFieldError, reset } = useFormAnswers<AboutYouValues>(aboutFromStore(basicProfile));
  const [avatarUrl, setAvatarUrl] = useState<string | null>(basicProfile.avatarUrl);
  const [photoData, setPhotoData] = useState<string | null>(basicProfile.photoData);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // The review screen can edit these answers while this step sits below it in
  // the stack; reload them whenever the step comes back into view, or a later
  // Continue would write the stale copy over the edit.
  useFocusEffect(
    useCallback(() => {
      const saved = useRegistrationStore.getState().basicProfile;
      reset(aboutFromStore(saved));
      setAvatarUrl(saved.avatarUrl);
      setPhotoData(saved.photoData);
    }, [reset]),
  );

  // ── Animations ─────────────────────────────────────────────────
  const avatarEntry = useAnimatedEntry(0);
  const fieldsEntry = useAnimatedEntry(1);
  const avatarPress = useAnimatedPress();


  // ── Photo ──────────────────────────────────────────────────────
  // Picked, cropped square and shrunk to 512px here; the data URL travels
  // with the application at Step 9 and becomes the profile photo at approval.
  const pickPhoto = useCallback(async (source: 'camera' | 'library') => {
    const picked = await pickProfilePhoto(source);
    if (!picked) return;
    setAvatarUrl(picked.uri);
    setPhotoData(picked.dataUrl);
  }, []);

  const handleAvatarPress = () => {
    showPhotoMenu({
      canRemove: avatarUrl !== null,
      onPick: pickPhoto,
      onRemove: () => {
        setAvatarUrl(null);
        setPhotoData(null);
      },
    });
  };

  // ── Submit ─────────────────────────────────────────────────────
  // The email becomes the account's login, so an address that already has
  // one is refused here — not seven steps later at submission, where the
  // whole form used to fail with a generic error.
  const handleContinue = async () => {
    if (!validate(validateAboutYou)) return;
    const cleaned = cleanAboutYou(answers);

    setCheckingEmail(true);
    try {
      const problem = await checkEmailAvailability(cleaned.email);
      if (problem) {
        setFieldError('email', problem);
        return;
      }
    } catch {
      setFieldError('email', "We couldn't check this email. Check your connection and try again.");
      return;
    } finally {
      setCheckingEmail(false);
    }

    updateBasicProfile({ ...cleaned, avatarUrl, photoData });
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
      ctaLoading={checkingEmail}
      ctaDisabled={checkingEmail}
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

      <Animated.View style={fieldsEntry}>
        <AboutYouFields value={answers} onChange={handleChange} errors={errors} />
      </Animated.View>
    </RegistrationLayout>
  );
};

/**
 * Brand-dependent colors are applied inline at render time so club branding
 * shows; everything here is brand-neutral.
 */
const AVATAR_SIZE = 96;

const styles = StyleSheet.create({
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
});
