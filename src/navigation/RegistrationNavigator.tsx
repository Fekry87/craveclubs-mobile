import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RegistrationStackParamList } from './types';
import { ClubSelectionScreen } from '../screens/Registration/ClubSelectionScreen';
import {
  Step1_BasicProfile,
  Step2_PhysicalInfo,
  Step3_SportType,
  Step4_ExperienceLevel,
  Step5_BranchSelection,
  Step6_SubscriptionPlan,
  Step7_CoachSelection,
  Step8_ReviewPayment,
  RegistrationSuccess,
} from '../screens/Registration';

const Stack = createNativeStackNavigator<RegistrationStackParamList>();

export const RegistrationNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ClubSelection" component={ClubSelectionScreen} />
      <Stack.Screen name="Step1_BasicProfile" component={Step1_BasicProfile} />
      <Stack.Screen name="Step2_PhysicalInfo" component={Step2_PhysicalInfo} />
      <Stack.Screen name="Step3_SportType" component={Step3_SportType} />
      <Stack.Screen
        name="Step4_ExperienceLevel"
        component={Step4_ExperienceLevel}
      />
      <Stack.Screen
        name="Step5_BranchSelection"
        component={Step5_BranchSelection}
      />
      <Stack.Screen
        name="Step6_SubscriptionPlan"
        component={Step6_SubscriptionPlan}
      />
      <Stack.Screen
        name="Step7_CoachSelection"
        component={Step7_CoachSelection}
      />
      <Stack.Screen
        name="Step8_ReviewPayment"
        component={Step8_ReviewPayment}
      />
      <Stack.Screen
        name="RegistrationSuccess"
        component={RegistrationSuccess}
      />
    </Stack.Navigator>
  );
};
