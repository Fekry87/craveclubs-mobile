import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../Icon';
import { Button } from '../Button';
import { colors, spacing } from '../../../theme';
import { styles } from './styles';

interface FormSheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSave: () => void;
  saveTitle?: string;
  saveDisabled?: boolean;
  children: React.ReactNode;
}

/**
 * Bottom sheet for editing a group of fields in place: a title with a close
 * button, scrolling content, and a pinned Save button. Closing (backdrop, X,
 * Android back) discards the edit; only Save commits it — the parent decides
 * what saving means and whether the sheet closes.
 */
export const FormSheet: React.FC<FormSheetProps> = ({
  visible,
  title,
  onClose,
  onSave,
  saveTitle = 'Save changes',
  saveDisabled = false,
  children,
}) => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const slide = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      slide.setValue(height);
      Animated.spring(slide, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, height, slide]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.overlay}>
          <Pressable
            style={styles.backdrop}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close without saving"
          />
          <Animated.View
            style={[
              styles.sheet,
              { maxHeight: height - insets.top - spacing.lg, transform: [{ translateY: slide }] },
            ]}
            accessibilityViewIsModal
          >
            <View style={styles.handleRow}>
              <View style={styles.handle} />
            </View>
            <View style={styles.header}>
              <Text style={styles.title} accessibilityRole="header">
                {title}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Close without saving"
              >
                <Icon name="close-line" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
              <Button title={saveTitle} onPress={onSave} disabled={saveDisabled} />
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
