import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Icon } from '../../../common/Icon';
import { useAnimatedEntry } from '../../../../hooks/useAnimatedEntry';
import { useAnimatedPress } from '../../../../hooks/useAnimatedPress';
import { colors } from '../../../../theme';
import { styles } from './styles';

interface SelectCardProps {
  title: string;
  subtitle?: string | null;
  /** Small tinted tag next to the title, e.g. "Popular". */
  badge?: string;
  /** Icon tile or avatar on the left. */
  leading?: React.ReactNode;
  /** Extra rows under the subtitle (price, phone, bio…). */
  children?: React.ReactNode;
  selected: boolean;
  onPress: () => void;
  /** Stagger index for the entry animation. */
  index?: number;
  /** Drawn but not choosable (a full group, a plan nobody can join right now). */
  disabled?: boolean;
}

/**
 * One choice in a single-select list (level, branch, plan, coach).
 *
 * Every registration list used to draw its own card with its own colors and a
 * 2pt border, and read the brand color from StyleSheet.create — so selections
 * stayed the platform violet in a club's colored flow. This one reads the
 * brand at render time, and a radio ring makes "tap to choose" obvious before
 * anything is selected.
 */
export const SelectCard: React.FC<SelectCardProps> = ({
  title,
  subtitle,
  badge,
  leading,
  children,
  selected,
  onPress,
  index = 0,
  disabled = false,
}) => {
  const entry = useAnimatedEntry(Math.min(index, 10));
  const press = useAnimatedPress();

  return (
    <Animated.View style={[styles.wrapper, entry, disabled && styles.disabled]}>
      <TouchableOpacity
        onPress={disabled ? undefined : onPress}
        onPressIn={disabled ? undefined : press.onPressIn}
        onPressOut={disabled ? undefined : press.onPressOut}
        activeOpacity={disabled ? 1 : 0.85}
        accessibilityRole="radio"
        accessibilityState={{ selected, disabled }}
        accessibilityLabel={[title, subtitle].filter(Boolean).join(', ')}
      >
        <Animated.View
          style={[
            styles.card,
            selected && [
              styles.cardSelected,
              { borderColor: colors.primary, backgroundColor: colors.primaryDim },
            ],
            press.animatedStyle,
          ]}
        >
          {leading}
          <View style={styles.body}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{title}</Text>
              {badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              ) : null}
            </View>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            {children}
          </View>
          <View style={styles.radio}>
            <Icon
              name={selected ? 'checkbox-circle-fill' : 'checkbox-blank-circle-line'}
              size={22}
              color={selected ? colors.primary : colors.textDim}
            />
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};
