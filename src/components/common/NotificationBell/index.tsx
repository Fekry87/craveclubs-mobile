import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Icon } from '../Icon';
import { useNotificationStore } from '../../../store/notification.store';
import { RootStackParamList } from '../../../navigation/types';
import { colors, fontFamily, spacing } from '../../../theme';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const NotificationBell: React.FC = () => {
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const navigation = useNavigation<NavProp>();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('NotificationCenter')}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={s.container}
    >
      <Icon
        name={unreadCount > 0 ? 'notification-3-fill' : 'notification-3-line'}
        size={22}
        color={unreadCount > 0 ? colors.primary : colors.textMuted}
      />
      {unreadCount > 0 && (
        <View style={s.badge}>
          {unreadCount <= 99 ? (
            <Text style={s.badgeText}>{unreadCount}</Text>
          ) : (
            <Text style={s.badgeText}>99+</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  container: {
    marginRight: spacing.md,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.white,
    lineHeight: 12,
  },
});
