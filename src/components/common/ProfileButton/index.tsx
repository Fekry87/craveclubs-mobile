import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SwimmerAvatar } from '../SwimmerAvatar';
import { useAuthStore } from '../../../store/auth.store';
import { useProfileStore } from '../../../store/profile.store';
import { RootStackParamList } from '../../../navigation/types';
import { colors, spacing } from '../../../theme';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const AVATAR_SIZE = 30;

/**
 * The swimmer's face in the header (top-right, beside the bell). Opens the
 * Profile as a full screen with a back button, so Profile no longer needs a
 * bottom tab. Shows the uploaded photo, else the swimmer's initials.
 */
export const ProfileButton: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const user = useAuthStore((s) => s.user);
  const profile = useProfileStore((s) => s.data?.profile);

  const firstName = profile?.first_name || user?.name?.split(' ')[0] || '';
  const lastName =
    profile?.last_name || user?.name?.split(' ').slice(1).join(' ') || '';

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Profile')}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={s.container}
      accessibilityRole="button"
      accessibilityLabel="Profile"
    >
      <SwimmerAvatar
        avatarUrl={profile?.avatar_url}
        size={AVATAR_SIZE}
        fallback="initials"
        firstName={firstName}
        lastName={lastName}
      />
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  container: {
    marginRight: spacing.md,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
});
