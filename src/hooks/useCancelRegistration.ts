import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRegistrationStore } from '../store/registration.store';

/**
 * Leave the registration flow from any step, after confirming.
 *
 * Every answer lives only in the registration store until it is submitted, so
 * leaving throws all of it away — the dialog says so, and "Keep going" is the
 * safe default.
 */
export const useCancelRegistration = () => {
  const navigation = useNavigation();
  const resetRegistration = useRegistrationStore((s) => s.resetRegistration);

  return useCallback(() => {
    Alert.alert(
      'Cancel registration?',
      "Everything you've filled in so far will be lost.",
      [
        { text: 'Keep going', style: 'cancel' },
        {
          text: 'Cancel registration',
          style: 'destructive',
          onPress: () => {
            resetRegistration();
            // The registration stack sits inside the root stack; close it.
            const parent = navigation.getParent();
            if (parent?.canGoBack()) parent.goBack();
            else if (navigation.canGoBack()) navigation.goBack();
          },
        },
      ],
    );
  }, [navigation, resetRegistration]);
};
