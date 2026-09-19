import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  I18nManager,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { s, GLASS_BAR_GAP } from './styles';
import { colors } from '../../../theme';

/**
 * A floating, frosted-glass bottom tab bar (App Store style): a rounded pill
 * that hovers over the canvas, blurring what sits behind it. Each tab reuses
 * the navigator's own `tabBarIcon`, so icon/label config stays per-navigator.
 * The blur is real on iOS; Android falls back to a translucent tint.
 */
export const GlassTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  // Respect per-screen hiding (deep coach screens set tabBarStyle display none).
  const focusedOptions = descriptors[state.routes[state.index].key].options;
  const flattened = StyleSheet.flatten(focusedOptions.tabBarStyle) as
    | { display?: string }
    | undefined;
  if (flattened?.display === 'none') return null;

  const bottom = Math.max(insets.bottom, GLASS_BAR_GAP);

  return (
    <View style={[s.wrap, { bottom }]} pointerEvents="box-none">
      <BlurView
        intensity={Platform.OS === 'ios' ? 40 : 25}
        tint="light"
        experimentalBlurMethod="dimezisBlurView"
        style={s.bar}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const color = focused ? colors.primary : colors.textDim;

          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : (options.title ?? route.name);

          const showBadge = options.tabBarBadge !== undefined;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <TouchableOpacity
              key={route.key}
              style={s.tab}
              onPress={onPress}
              onLongPress={onLongPress}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={typeof label === 'string' ? label : route.name}
            >
              <View style={s.iconWrap}>
                {options.tabBarIcon?.({ focused, color, size: 24 })}
                {showBadge && (
                  <View
                    style={[s.badge, I18nManager.isRTL ? { left: -2 } : { right: -2 }]}
                  />
                )}
              </View>
              <Text style={[s.label, { color }]} numberOfLines={1}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
};
