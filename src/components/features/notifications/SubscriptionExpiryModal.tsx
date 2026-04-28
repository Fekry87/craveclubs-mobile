import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Icon } from '../../common/Icon';
import {
  colors,
  spacing,
  fontFamily,
  borderRadius,
  shadows,
} from '../../../theme';

interface Props {
  visible: boolean;
  daysLeft: number;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export const SubscriptionExpiryModal: React.FC<Props> = ({
  visible,
  daysLeft,
  onClose,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  const safeDays = Math.max(daysLeft, 0);
  const title =
    safeDays <= 0
      ? 'اشتراكك انتهى'
      : safeDays === 1
        ? 'اشتراكك ينتهي غداً'
        : `اشتراكك ينتهي خلال ${safeDays} أيام`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <Animated.View
          style={[
            s.card,
            { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Icon */}
          <View style={s.iconCircle}>
            <Icon name="time-fill" size={36} color={colors.orange} />
          </View>

          {/* Title */}
          <Text style={s.title}>{title}</Text>

          {/* Body */}
          <Text style={s.body}>
            تواصل مع إدارة النادي لتجديد اشتراكك والاستمرار في التدريب.
          </Text>

          {/* Button */}
          <TouchableOpacity
            style={s.button}
            activeOpacity={0.8}
            onPress={onClose}
          >
            <Text style={s.buttonText}>حسناً</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: width - spacing.lg * 2,
    backgroundColor: colors.white,
    borderRadius: borderRadius.modal,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    ...shadows.lg,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.orangeDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontFamily: fontFamily.headingBold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: 14,
    fontFamily: fontFamily.bodyRegular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.orange,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.sm,
    borderBottomWidth: 4,
    borderBottomColor: colors.orangeDark,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.white,
  },
});
