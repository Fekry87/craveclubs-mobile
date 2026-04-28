import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../../common/Card';
import { UserInterface, SwimmerProfileInterface } from '../../../../types/models.types';
import { getInitials } from '../../../../utils/formatters';
import { colors, gradients } from '../../../../theme';
import { styles } from './styles';

interface ProfileHeaderProps {
  user: UserInterface;
  profile?: SwimmerProfileInterface | null;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  profile,
}) => {
  const firstName = profile?.first_name || user.name.split(' ')[0];
  const lastName = profile?.last_name || user.name.split(' ').slice(1).join(' ');
  const initials = getInitials(firstName, lastName || 'S');

  const avatarScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(avatarScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [avatarScale]);

  return (
    <Card>
      <View style={styles.content}>
        <Animated.View style={[styles.avatarWrapper, { transform: [{ scale: avatarScale }] }]}>
          <LinearGradient
            colors={[...gradients.avatar]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
        </Animated.View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {firstName} {lastName}
            </Text>
            {profile?.level && (
              <View style={[styles.levelBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.levelText}>{profile.level}</Text>
              </View>
            )}
          </View>
          <Text style={styles.email} numberOfLines={1}>{user.email}</Text>
        </View>
      </View>
    </Card>
  );
};
