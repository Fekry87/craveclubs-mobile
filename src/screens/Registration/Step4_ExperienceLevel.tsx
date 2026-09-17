import React, { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RegistrationStackParamList } from '../../navigation/types';
import { RegistrationLayout } from '../../components/features/registration/RegistrationLayout';
import { ExperienceFields } from '../../components/features/registration/ExperienceFields';
import { useRegistrationStore } from '../../store/registration.store';
import { useFormAnswers } from '../../hooks/useFormAnswers';
import {
  ExperienceValues,
  experienceFromStore,
  validateExperience,
} from '../../utils/registrationValidation';

type Props = NativeStackScreenProps<
  RegistrationStackParamList,
  'Step4_ExperienceLevel'
>;

export const Step4_ExperienceLevel: React.FC<Props> = ({ navigation }) => {
  const { experience, updateExperience, setStep } = useRegistrationStore();

  const { answers, errors, handleChange, validate, reset } = useFormAnswers<ExperienceValues>(
    experienceFromStore(experience),
  );

  // Reload on focus: the review screen may have edited these meanwhile.
  useFocusEffect(
    useCallback(() => {
      reset(experienceFromStore(useRegistrationStore.getState().experience));
    }, [reset]),
  );


  const handleContinue = () => {
    if (!validate(validateExperience)) return;
    updateExperience(answers);
    setStep(5);
    navigation.navigate('Step5_BranchSelection');
  };

  return (
    <RegistrationLayout
      currentStep={4}
      title="Your experience"
      subtitle="Help us understand your current level"
      onBack={() => {
        setStep(3);
        navigation.goBack();
      }}
      ctaTitle="Continue"
      onCtaPress={handleContinue}
    >
      <ExperienceFields value={answers} onChange={handleChange} errors={errors} />
    </RegistrationLayout>
  );
};
