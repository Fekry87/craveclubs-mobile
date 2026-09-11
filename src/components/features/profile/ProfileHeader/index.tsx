import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { UserInterface, SwimmerProfileInterface } from '../../../../types/models.types';
import { getInitials } from '../../../../utils/formatters';
import { colors } from '../../../../theme';
import { styles } from './styles';

interface ProfileHeaderProps {
  user: UserInterface;
  profile?: SwimmerProfileInterface | null;
}

/** Centered hero: brand-colored avatar, name, email, level pill */
export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  profile,
}) => {
  const firstName = profile?.first_name || user.name.split(' ')[0];
  const lastName = profile?.last_name || user.name.split(' ').slice(1).join(' ');
  const initials = getInitials(firstName, lastName || 'S');

  const avatarScale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.spring(avatarScale, {
      toValue: 1,
      speed: 14,
      bounciness: 8,
      useNativeDriver: true,
    }).start();
  }, [avatarScale]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.avatar,
          { backgroundColor: colors.primary, transform: [{ scale: avatarScale }] },
        ]}
      >
        <Text style={styles.avatarText}>{initials}</Text>
      </Animated.View>
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
