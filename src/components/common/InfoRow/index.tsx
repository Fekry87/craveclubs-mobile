import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon, IconName } from '../Icon';
import { DirectionalIcon } from '../DirectionalIcon';
import { colors } from '../../../theme';
import { styles } from './styles';

export interface InfoRowProps {
  icon: IconName;
  label: string;
  value: string;
  hint?: string;
  /** Makes the row tappable and adds a chevron (call, maps, navigate). */
  onPress?: () => void;
  isLast?: boolean;
}

/**
 * Settings-style row: tinted icon tile, small label, value, optional hint.
 * Shared by Profile and Session detail so both read as one design.
 */
export const InfoRow: React.FC<InfoRowProps> = ({
  icon,
  label,
  value,
  hint,
  onPress,
  isLast = false,
}) => {
  const content = (
    <>
      <View style={styles.icon}>
        <Icon name={icon} size={18} color={colors.textMuted} />
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value} numberOfLines={2}>
          {value}
        </Text>
        {hint ? (
          <Text style={styles.hint} numberOfLines={2}>
            {hint}
          </Text>
        ) : null}
      </View>
      {onPress && (
        <DirectionalIcon name="arrow-right-s-line" size={20} color={colors.textDim} />
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.row, isLast && styles.rowLast]}
        onPress={onPress}
        activeOpacity={0.6}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value}`}
      >
        {content}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.row, isLast && styles.rowLast]}>{content}</View>;
};
