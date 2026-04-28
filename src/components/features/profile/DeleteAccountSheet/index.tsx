import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Icon } from '../../../common/Icon';
import { useAuthStore } from '../../../../store/auth.store';
import { colors } from '../../../../theme';
import { styles, SHEET_HEIGHT } from './styles';

interface DeleteAccountSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const DeleteAccountSheet: React.FC<DeleteAccountSheetProps> = ({
  visible,
  onClose,
}) => {
  const [error, setError] = useState<string | null>(null);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const isDeletingAccount = useAuthStore((s) => s.isDeletingAccount);

  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      setError(null);
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 10,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(SHEET_HEIGHT);
    }
  }, [visible, slideAnim]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SHEET_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const handleDelete = async () => {
    setError(null);
    try {
      await deleteAccount();
      // User is automatically logged out — RootNavigator redirects to Login
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string } };
      };
      setError(
        axiosError?.response?.data?.message ??
          'Something went wrong. Please try again.',
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY: slideAnim }] },
          ]}
          onStartShouldSetResponder={() => true}
        >
          {/* Drag handle */}
          <View style={styles.handleRow}>
            <View style={styles.handle} />
          </View>

          {/* Warning icon */}
          <View style={styles.iconCircle}>
            <Icon name="error-warning-fill" size={28} color={colors.error} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Delete Account?</Text>

          {/* Description */}
          <Text style={styles.description}>
            Your account will be deactivated immediately. You have{' '}
            <Text style={styles.bold}>30 days</Text> to reactivate it by
            signing in again. After 30 days, all your data will be permanently
            deleted and cannot be recovered.
          </Text>

          {/* Error banner */}
          {error && (
            <View style={styles.errorBanner}>
              <Icon name="error-warning-line" size={16} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.buttonHalf, styles.keepButton]}
              onPress={handleClose}
              activeOpacity={0.8}
              disabled={isDeletingAccount}
            >
              <Text style={styles.keepButtonText}>Keep Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.buttonHalf,
                styles.deleteButton,
                isDeletingAccount && styles.deleteButtonDisabled,
              ]}
              onPress={handleDelete}
              activeOpacity={0.8}
              disabled={isDeletingAccount}
            >
              {isDeletingAccount ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.deleteButtonText}>Delete Account</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};
