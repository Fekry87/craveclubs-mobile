import React from 'react';
import { View, Text } from 'react-native';
import { Icon, IconName } from '../../../common/Icon';
import { colors } from '../../../../theme';
import { styles } from './styles';

interface InlineNoticeProps {
  icon?: IconName;
  title: string;
  message: string;
}

/**
 * A tinted note inside a step — for something the swimmer should know before
 * choosing, like "every group of this type is full". Warning-tinted, never
 * red: nothing went wrong, the club is just full there.
 */
export const InlineNotice: React.FC<InlineNoticeProps> = ({ icon = 'information-line', title, message }) => (
  <View style={styles.container} accessibilityRole="alert">
    <View style={styles.iconTile}>
      <Icon name={icon} size={18} color={colors.warningDark} />
    </View>
    <View style={styles.body}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  </View>
);
