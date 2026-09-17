import React, { useCallback } from 'react';
import { Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegistrationStackParamList } from '../../navigation/types';
import { RegistrationLayout } from '../../components/features/registration/RegistrationLayout';
import { BodyFields } from '../../components/features/registration/BodyFields';
import { useRegistrationStore } from '../../store/registration.store';
import { useFormAnswers } from '../../hooks/useFormAnswers';
import { useAnimatedEntry } from '../../hooks/useAnimatedEntry';
import {
  BodyValues,
  bodyFromStore,
  validateBody,
} from '../../utils/registrationValidation';

type Props = NativeStackScreenProps<
  RegistrationStackParamList,
  'Step2_PhysicalInfo'
>;

export const Step2_PhysicalInfo: React.FC<Props> = ({ navigation }) => {
  const { physicalInfo, updatePhysicalInfo, setStep } = useRegistrationStore();

  const { answers, errors, handleChange, validate, reset } = useFormAnswers<BodyValues>(
    bodyFromStore(physicalInfo),
  );

  // Reload on focus: the review screen may have edited these meanwhile.
  useFocusEffect(
    useCallback(() => {
      reset(bodyFromStore(useRegistrationStore.getState().physicalInfo));
    }, [reset]),
  );
  const entry = useAnimatedEntry(0);


  const handleContinue = () => {
    if (!validate(validateBody)) return;
    updatePhysicalInfo(answers);
    setStep(3);
    navigation.navigate('Step3_SportType');
  };

  return (
    <RegistrationLayout
      currentStep={2}
      title="Physical information"
      subtitle="Helps your coach build the right plan"
      onBack={() => {
        setStep(1);
        navigation.goBack();
      }}
      ctaTitle="Continue"
      onCtaPress={handleContinue}
    >
      <Animated.View style={entry}>
        <BodyFields value={answers} onChange={handleChange} errors={errors} />
      </Animated.View>
    </RegistrationLayout>
  );
};
