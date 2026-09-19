import React from 'react';
import { View, I18nManager } from 'react-native';
import { Icon, IconName } from '../Icon';

interface DirectionalIconProps {
  name: IconName;
  size?: number;
  color?: string;
}

/**
 * An arrow/chevron that mirrors horizontally under RTL, so "back" points the
 * way the user came from and "forward"/see-all points onward. Use it only for
 * directional glyphs (arrows, chevrons) — never for symmetric icons.
 */
export const DirectionalIcon: React.FC<DirectionalIconProps> = ({
  name,
  size,
  color,
}) => {
  if (!I18nManager.isRTL) {
    return <Icon name={name} size={size} color={color} />;
  }
  return (
    <View style={{ transform: [{ scaleX: -1 }] }}>
      <Icon name={name} size={size} color={color} />
    </View>
  );
};
