import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity } from 'react-native';
import { Icon } from '../../../common/Icon';
import { SwimmerAvatar } from '../../../common/SwimmerAvatar';
import { UserInterface, SwimmerProfileInterface } from '../../../../types/models.types';
import { colors } from '../../../../theme';
import { styles, AVATAR_SIZE } from './styles';

interface ProfileHeaderProps {
  user: UserInterface;
  profile?: SwimmerProfileInterface | null;
  /** Tapping the avatar or its camera badge; omitted = not changeable here. */
  onChangePhoto?: () => void;
  /** A spinner-less dim while the upload is in flight. */
  photoBusy?: boolean;
}

/** Centered hero: the swimmer's photo (or brand-colored initials), name, email, level pill */
export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  profile,
  onChangePhoto,
  photoBusy = false,
}) => {
  const firstName = profile?.first_name || user.name.split(' ')[0];
  const lastName = profile?.last_name || user.name.split(' ').slice(1).join(' ');

  const avatarScale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.spring(avatarScale, {
      toValue: 1,
      speed: 14,
      bounciness: 8,
      useNativeDriver: true,
    }).start();
  }, [avatarScale]);

  const avatar = (
    <Animated.View
      style={[styles.avatarWrap, { transform: [{ scale: avatarScale }], opacity: photoBusy ? 0.6 : 1 }]}
    >
      <SwimmerAvatar
        avatarUrl={profile?.avatar_url}
        size={AVATAR_SIZE}
        fallback="initials"
        firstName={firstName}
        lastName={lastName || 'S'}
        initialsBackground={colors.primary}
        initialsColor={colors.white}
      />
      {onChangePhoto && (
        <View style={[styles.cameraBadge, { backgroundColor: colors.primary }]}>
          <Icon name="camera-fill" size={14} color={colors.white} />
        </View>
      )}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {onChangePhoto ? (
        <TouchableOpacity
          onPress={onChangePhoto}
          disabled={photoBusy}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={profile?.avatar_url ? 'Change photo' : 'Add a photo'}
        >
          {avatar}
        </TouchableOpacity>
      ) : (
        avatar
      )}
      <Text style={styles.name} numberOfLines={1}>
        {firstName} {lastName}
      </Text>
      <Text style={styles.email} numberOfLines={1}>
        {user.email}
      </Text>
      {profile?.level && (
        <View style={[styles.levelBadge, { backgroundColor: colors.primaryDim }]}>
          <Text style={[styles.levelText, { color: colors.primary }]}>{profile.level}</Text>
        </View>
      )}
    </View>
  );
};
